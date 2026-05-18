export interface AppEnv {
  port: number;
  mongoUri: string;
  useInMemoryDb: boolean;
  clientUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}
