interface WebpackRequireContext {
  keys(): string[];
  <T>(id: string): T;
}

declare var require: {
  context: (
    path: string,
    deep?: boolean,
    filter?: RegExp,
  ) => WebpackRequireContext;
};

declare module "clsx";