import { Region } from "../types/OrderTypes";

const ufToRegion: { [key: string]: Region } = {
  AC: "Norte",
  AP: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  AL: "Nordeste",
  BA: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  PE: "Nordeste",
  PI: "Nordeste",
  RN: "Nordeste",
  SE: "Nordeste",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  ES: "Sudeste",
  MG: "Sudeste",
  RJ: "Sudeste",
  SP: "Sudeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
};

function classifyRegion(uf: string): Region | undefined {
  return ufToRegion[uf];
}

function setUTCHoursStart(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(3, 0, 0, 0);
  return lDate;
}

function setUTCHoursEnd(date?: Date): Date {
  if (!date) date = new Date();
  let lDate = new Date(date);
  lDate.setUTCHours(23, 59, 59, 998);
  return lDate;
}

export const lib = {
  classifyRegion,
  setUTCHoursStart,
  setUTCHoursEnd,
};
