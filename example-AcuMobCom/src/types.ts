type AcuMobComParam = {
  webRTCAccessKey: string;
  webRTCToken: string;
  cloudRegionId: string;
  logLevel: number | string;
  registerClientId: string;
};

export type AuthStackParam = {
  Register: undefined;
  AcuMobCom: AcuMobComParam;
};
