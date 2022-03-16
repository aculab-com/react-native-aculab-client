type AculabCallParam = {
  webRTCAccessKey: string;
  webRTCToken: string;
  cloudRegionId: string;
  logLevel: number | string;
  registerClientId: string;
};

export type AuthStackParam = {
  Register: undefined;
  AculabCall: AculabCallParam;
};

export type ButtonProps = {
  title: string;
  colour?: string;
  onPress: ((event: any) => void) | undefined;
};

export type RoundButtonProps = {
  iconName: string;
  onPress: () => void;
};
