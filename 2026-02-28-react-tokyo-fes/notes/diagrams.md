## basic flow

cf. https://github.com/reactwg/server-components/discussions/4

```mermaid
graph TD
    A["React virtual dom tree<br/><small>(with Server Components and Client References)</small>"] -->
    |"[react-server-dom-xxx/server]<br /><code>renderToReadableStream</code>"
    | B["RSC Stream<br/><small>(Serialized VDOM with Client References. Server components are evaluated away)</small>"];

    B -->
    |"[react-server-dom-xxx/client]<br /><code>createFromReadableStream</code>"
    | C["React virtual dom tree<br/><small>(Client References are revived to actual client component instances)</small>"];

    C -->
    |"[react-dom/client]<br/>(CSR: mount, hydration)"
    | D["DOM Elements"];

    C -->
    |"[react-dom/server]<br/>(SSR)"| E["HTML String/Stream"];

    style A fill:#D6EAF8,stroke:#333,stroke-width:2px
    style B fill:#FEF9E7,stroke:#333,stroke-width:2px
    style C fill:#D6EAF8,stroke:#333,stroke-width:2px
    style D fill:#D5F5E3,stroke:#333,stroke-width:2px
    style E fill:#FADBD8,stroke:#333,stroke-width:2px
```

## Basic flow separated by environments

This illustrates `ssr` environment is technically an optional mechanism.

```mermaid
graph TD

    subgraph "<strong>rsc environment</strong>"
        A["React virtual dom tree"] --> |"<code>renderToReadableStream</code><br/>[@hiogawa/vite-rsc/rsc]<br />(re-export of react-server-dom/server.edge)<br />"| B1["RSC Stream"];
    end

    B1 --> |"just pass stream object inside the same runtime or server IPC"| B2
    B1 --> |"e.g. client-side fetch or inject payload along side SSR"| B3

    subgraph "<strong>ssr environment</strong>"
        B2["RSC Stream"] --> |"<code>createFromReadableStream</code><br/>[@hiogawa/vite-rsc/ssr]<br />(re-export of react-server-dom/client.edge)<br />"| C1["React virtual dom tree"];
        C1 --> |"[react-dom/server]<br/>SSR"| E["HTML String/Stream"];
    end

    subgraph "<strong>client environment</strong>"
        B3["RSC Stream"] --> |"<code>createFromReadableStream</code><br/>[@hiogawa/vite-rsc/browser]<br />(re-export of react-server-dom/client.browser)<br />"| C2["React virtual dom tree"];
        C2 --> |"[react-dom/client]<br/>CSR: mount, hydration"| D["DOM Elements"];
    end

    style A fill:#D6EAF8,stroke:#333,stroke-width:2px
    style B1 fill:#FEF9E7,stroke:#333,stroke-width:2px
    style B2 fill:#FEF9E7,stroke:#333,stroke-width:2px
    style B3 fill:#FEF9E7,stroke:#333,stroke-width:2px
    style C1 fill:#D6EAF8,stroke:#333,stroke-width:2px
    style C2 fill:#D6EAF8,stroke:#333,stroke-width:2px
    style D fill:#D5F5E3,stroke:#333,stroke-width:2px
    style E fill:#FADBD8,stroke:#333,stroke-width:2px
```

`rsc` environment can serialize and deserialize within itself

```mermaid
graph TD

    subgraph "<strong>rsc environment</strong>"
        A["React virtual dom tree"] -->
        |"<code>renderToReadableStream</code><br/>[@hiogawa/vite-rsc/rsc]<br />(re-export of react-server-dom/server.edge)<br />"
        | B1["RSC Stream"];

        B1["RSC Stream"] -->
        |"<code>createFromReadableStream</code><br/>[@hiogawa/vite-rsc/rsc]<br />(re-export of react-server-dom/client.edge)<br />"
        | A["React virtual dom tree"];
    end

    style A fill:#D6EAF8,stroke:#333,stroke-width:2px
    style B1 fill:#FEF9E7,stroke:#333,stroke-width:2px
```
