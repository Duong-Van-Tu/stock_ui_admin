export class AppEnv {
  constructor(
    public readonly feHost: string,
    public readonly apiHost: string,
    public readonly socketHost: string
  ) {}
}

export const appEnvs: Record<string, AppEnv> = {
  default: new AppEnv(
    process.env.NEXT_PUBLIC_FE_HOST as string,
    process.env.NEXT_PUBLIC_API_HOST as string,
    process.env.NEXT_PUBLIC_URL_WS_SERVER as string
  )
};
