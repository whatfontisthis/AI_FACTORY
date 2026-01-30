declare module "react-katex" {
  import * as React from "react";

  interface KaTeXProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error | string) => React.ReactNode;
    settings?: any;
  }

  export class InlineMath extends React.Component<KaTeXProps> {}
  export class BlockMath extends React.Component<KaTeXProps> {}
}
