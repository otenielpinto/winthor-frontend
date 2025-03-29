"use client";
import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Table,
} from "antd";
import { QRCode } from "antd";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const { Title, Text } = Typography;
import { lib } from "@/lib/lib";

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pendente: { label: "PENDENTE", color: "#faad14" },
    "em trânsito": { label: "EM TRÂNSITO", color: "#1890ff" },
    concluída: { label: "CONCLUÍDA", color: "#52c41a" },
  };
  return statusMap[status] || { label: status.toUpperCase(), color: "#000000" };
};

// Client-side only component for current timestamp
const CurrentDateTime: React.FC = () => {
  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    setDateTime(format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss"));
  }, []);

  return <>{dateTime}</>;
};

// Client-side only component for formatted time
const FormattedTime: React.FC<{ date: Date }> = ({ date }) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(format(date, "HH:mm:ss"));
  }, [date]);

  return <>{time}</>;
};

function RomaneioColeta({ data }: any) {
  if (!data || data.length === 0) {
    return <div>Sem dados para exibir.</div>;
  }
  const componentRef = useRef<HTMLDivElement>(null);
  // State to ensure consistent dates
  const [formattedDate, setFormattedDate] = useState<string>("");
  let dataHoraColeta = lib.dateToBr();
  let idColeta = "PC" + Date.now();
  let statusColeta = "em trânsito";
  let numeroEcommerce = "";
  // Add item sequence to each data entry
  for (let i = 0; i < data?.length; i++) {
    // Add item sequence number (1-based index)
    data[i].item = i + 1;
  }

  // Initialize client name variable
  const [nomeTransportadora, setNomeTransportadora] = useState<string>("");

  useEffect(() => {
    setFormattedDate(
      format(dataHoraColeta, "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    );
  }, [dataHoraColeta]);

  const handlePrint = useReactToPrint({
    documentTitle: `Romaneio_Coleta_${idColeta}`,
    contentRef: componentRef,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    removeAfterPrint: true,
  });

  const status = getStatusLabel(statusColeta);

  return (
    <div>
      <Button type="primary" onClick={handlePrint} style={{ marginBottom: 16 }}>
        Imprimir / Exportar PDF
      </Button>

      <div
        ref={componentRef}
        style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
      >
        {/* Cabeçalho do documento */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* <div style={{ width: "150px", height: "60px", position: "relative" }}>
             Updated Image component with modern props 
            <Image
              src="/logo.png"
              alt="Logo da Empresa"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div> */}

          <div style={{ textAlign: "center", flex: 1 }}>
            <Title level={3} style={{ margin: 0 }}>
              ROMANEIO DE COLETA
            </Title>
            <Text>Documento para controle de mercadorias</Text>
          </div>
          <div>
            <QRCode
              value={`COLETA-${idColeta}-${numeroEcommerce}`}
              size={90}
              bordered={false}
            />
          </div>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Informações principais */}
        <Card style={{ marginBottom: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text strong>ID da Coleta:</Text>
              <div>
                <Text style={{ fontSize: "18px" }}>{idColeta}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Número E-commerce:</Text>
              <div>
                <Text style={{ fontSize: "18px" }}>{numeroEcommerce}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Status:</Text>
              <div>
                <Text
                  style={{
                    backgroundColor: status.color,
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                >
                  {status.label}
                </Text>
              </div>
            </Col>
            <Col span={16}>
              <Text strong>Transportadora:</Text>
              <div>
                <Text style={{ fontSize: "18px" }}>{nomeTransportadora}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Data e Hora:</Text>
              <div>
                <Text>{formattedDate}</Text>
                <br />
                <Text>
                  <FormattedTime date={dataHoraColeta} />
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Itens do romaneio (opcional) */}
        {data.length > 0 && (
          <Card title="Pacotes enviados" style={{ marginBottom: "20px" }}>
            <Table
              dataSource={data}
              pagination={false}
              size="small"
              rowKey="numero_ecommerce"
              columns={[
                { title: "Nº", dataIndex: "item", key: "item" },
                {
                  title: "Numero Ecommerce",
                  dataIndex: "numero_ecommerce",
                  key: "numero_ecommerce",
                },
                {
                  title: "Cliente",
                  dataIndex: "nome",
                  key: "nome",
                  align: "left",
                },
              ]}
            />
          </Card>
        )}

        {/* Área para assinatura */}
        <Row gutter={24} style={{ marginTop: "60px" }}>
          <Col span={12}>
            <div
              style={{
                borderTop: "1px solid #000",
                paddingTop: "8px",
                textAlign: "center",
              }}
            >
              <Text>Assinatura do Responsável pela Coleta</Text>
            </div>
          </Col>
          <Col span={12}>
            <div
              style={{
                borderTop: "1px solid #000",
                paddingTop: "8px",
                textAlign: "center",
              }}
            >
              <Text>Assinatura do Cliente</Text>
            </div>
          </Col>
        </Row>

        {/* Rodapé */}
        <div
          style={{
            marginTop: "60px",
            borderTop: "1px solid #ccc",
            paddingTop: "12px",
            textAlign: "center",
          }}
        >
          <Text type="secondary">
            Documento gerado em <CurrentDateTime />
          </Text>
          <br />
          <Text type="secondary">
            https://wta.ogestorpro.com.br/ | (51) 99866-4776
          </Text>
        </div>
      </div>
    </div>
  );
}

export default RomaneioColeta;
