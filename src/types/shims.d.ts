// Local shims to satisfy VS Code TypeScript without pulling global @types

declare module 'trusted-types' {
  interface TrustedTypePolicyFactory {
    createPolicy(name: string, options?: any): any;
  }
  const trustedTypes: TrustedTypePolicyFactory | undefined;
  export default trustedTypes;
}

declare module 'use-sync-external-store' {
  export function useSyncExternalStore<T>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => T,
    getServerSnapshot?: () => T
  ): T;
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      defaultTheme?: string;
    }
  }
}

export {};
