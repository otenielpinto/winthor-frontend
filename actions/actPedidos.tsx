"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { subDays, format } from "date-fns";
import { lib } from "@/lib/lib";
import {
  Region,
  Order,
  statusToString,
  statusToCodigo,
} from "@/types/OrderTypes";

interface DashboardData {
  totalOrders: number;
  salesVolume: number;
  averageProcessingTime: number;
  cancellationRate: number;
  ordersTrend: { date: string; orders: number }[];
  statusDistribution: { name: string; value: number }[];
  recentOrders: Order[];
}

function obterMessageWTA(wtaMessage: any) {
  if (!wtaMessage) {
    return "";
  }

  let result: string = "";

  if (wtaMessage.detailedMessage) {
    result =
      `Código: ${wtaMessage.code}\n` +
      `Mensagem: ${wtaMessage.detailedMessage}\n`;
  }

  if (wtaMessage && wtaMessage.details && wtaMessage.details.length > 0) {
    wtaMessage.details.forEach((detail: any) => {
      result =
        result +
        " " +
        `Código: ${detail.code}\n` +
        `Mensagem: ${detail.message}\n` +
        `Mensagem detalhada: ${detail.detailedMessage}`;
    });
  }

  return result;
}

export async function getDashboardPedidos(
  filters: any
): Promise<DashboardData> {
  const user: any = await getUser();
  let dt_movto = new Date();
  let days = 0;
  dt_movto = new Date(
    dt_movto.getFullYear(),
    dt_movto.getMonth(),
    dt_movto.getDate(),
    0,
    0,
    0,
    0
  );

  let period = filters.period;
  if (period === "daily") {
    days = 0;
  } else if (period === "weekly") {
    days = 7;
    dt_movto = subDays(new Date(), 7);
  } else if (period === "monthly") {
    dt_movto = subDays(new Date(), 30);
    days = 30;
  }
  //**************************************************************** */
  let query = {
    idtenant: user.empresa,
    dt_movto: { $gte: dt_movto },
  };
  const { client, clientdb } = await TMongo.connectToDatabase();
  const data = await clientdb.collection("order").find(query).toArray();

  //**************************************************************** */
  query.dt_movto = { $gte: subDays(new Date(), 7) };
  const rows = await clientdb
    .collection("order")
    .aggregate([
      //first stage
      {
        $match: query,
      },
      //Percorrer itens e agrupar por marca
      // {
      //   $unwind: "$itens",
      // },
      //second stage
      {
        $group: {
          _id: "$data_pedido",
          orders: {
            $sum: 1,
          },
        },
      },
      // Third Stage
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();

  // Alimentar ordersTrend com os dados obtidos pela variável rows
  const ordersTrend: { date: string; orders: number }[] = rows.map((row) => ({
    date: row._id.substring(0, 5),
    orders: row.orders,
  }));
  //**************************************************************** */
  await TMongo.mongoDisconnect(client);
  let total_pedido: number = 0;
  let orders: Order[] = [];
  let averageProcessingTimeList: number[] = [];

  const regionCounts: { [key in Region]: number } = {
    Norte: 0,
    Nordeste: 0,
    "Centro-Oeste": 0,
    Sudeste: 0,
    Sul: 0,
  };

  for (let order of data) {
    total_pedido += Number(order.pedido.total_pedido);
    let status_wta = obterMessageWTA(order.wta_message);
    let region: Region = lib.classifyRegion(order.pedido.cliente.uf) as Region;

    orders.push({
      id: order.pedido.id,
      numero: order.pedido.numero,
      numero_ecommerce: order.pedido.numero_ecommerce,
      nome_ecommerce: order.pedido.ecommerce.nomeEcommerce,
      date: order.pedido.data_pedido,
      status: `${statusToString(order.status)}\n ${status_wta}`,
      value: Number(order.pedido.total_pedido),
      region: region,
      nome: order.pedido.cliente.nome,
      status_processo: order.status,
      orderId: order.orderId,
    } as Order);

    regionCounts[region]++;

    if (order.status === 3) {
      let dt_movto = new Date(order.dt_movto);
      let dt_entrega = new Date(order.data_envio_nfe);
      let diff = Math.abs(dt_entrega.getTime() - dt_movto.getTime());
      averageProcessingTimeList.push(diff / (1000 * 60 * 60));
    }
  }

  let totalOrders: number = data.length;
  let salesVolume: number = total_pedido;
  let cancelledOrders: number = 0;

  // Filtrar Orders com status in (1, 2)
  let recentOrders: Order[] = orders.filter(
    (order) =>
      order.status_processo === 1 ||
      order.status_processo === 2 ||
      order.status_processo === 500
  );

  return {
    totalOrders,
    salesVolume,
    averageProcessingTime:
      averageProcessingTimeList.reduce((a, b) => a + b, 0) /
      averageProcessingTimeList.length,
    cancellationRate: (cancelledOrders / totalOrders) * 100,
    ordersTrend,
    statusDistribution: Object.entries(regionCounts).map(([name, value]) => ({
      name,
      value,
    })),
    recentOrders,
  };
}

export async function getPedidos(filters: any): Promise<any> {
  const user: any = await getUser();
  let startDate = filters.startDate
    ? lib.setUTCHoursStart(filters.startDate)
    : null;
  let endDate = filters.endDate ? lib.setUTCHoursEnd(filters.endDate) : null;
  let status = Number(statusToCodigo(filters.status));

  //**************************************************************** */
  let query = {
    idtenant: user.empresa,
    dt_movto: { $gte: startDate, $lte: endDate },
    ...(status && status !== 0 && { status: status }),
    ...(filters.numero && { numero: Number(filters.numero) }),
    ...(filters.ecommerceNumber && {
      numero_ecommerce: filters.ecommerceNumber,
    }),
    ...(filters.orderId && { orderId: filters.orderId }),
  };

  const { client, clientdb } = await TMongo.connectToDatabase();
  let rows = await clientdb.collection("order").find(query).toArray();
  //**************************************************************** */
  await TMongo.mongoDisconnect(client);
  let orders: Order[] = [];

  for (let order of rows) {
    let status_wta = obterMessageWTA(order.wta_message);
    let region: Region = lib.classifyRegion(order.pedido.cliente.uf) as Region;

    orders.push({
      id: order.pedido.id,
      numero: order.pedido.numero,
      numero_ecommerce: order.pedido.numero_ecommerce,
      nome_ecommerce: order.pedido.ecommerce.nomeEcommerce,
      date: order.pedido.data_pedido,
      status: `${statusToString(order.status)}\n ${status_wta}`,
      value: Number(order.pedido.total_pedido),
      region: region,
      nome: order.pedido.cliente.nome,
      status_processo: order.status,
      orderId: order.orderId,
    } as Order);
  }

  //aplicar filtros

  rows = [];
  return orders;
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  const user: any = await getUser();

  const { client, clientdb } = await TMongo.connectToDatabase();
  const order = await clientdb
    .collection("order")
    .findOne({ id: Number(orderId), idtenant: user.empresa });

  if (!order) {
    await TMongo.mongoDisconnect(client);
    return {
      success: false,
      message: "Pedido não encontrado " + orderId,
    };
  }

  if (order.orderId) {
    await TMongo.mongoDisconnect(client);
    return {
      success: false,
      message: "Não é possível excluir pedido com orderId " + order.orderId,
    };
  }

  if (![1, 2, 500].includes(order.status)) {
    await TMongo.mongoDisconnect(client);
    return {
      success: false,
      message: "Não é possível excluir pedido com este status " + order.id,
    };
  }

  await clientdb
    .collection("order")
    .deleteOne({ id: Number(orderId), idtenant: user.empresa });
  await TMongo.mongoDisconnect(client);
  return {
    success: true,
    message: "Pedido excluído com sucesso " + order.numero,
  };
}

//exemplo de como fiz uma atualização no campo dt_movto
// const collection = clientdb.collection("order");
// /// Iterar sobre os documentos e atualizar o campo dt_movto
// await collection.find({ data_pedido: { $exists: true } }).forEach((doc) => {
//   const [day, month, year] = doc.data_pedido.split("/");
//   const dt_movto = new Date(`${year}-${month}-${day}`);
//   collection.updateOne({ _id: doc._id }, { $set: { dt_movto: dt_movto } });
// });
// return;
