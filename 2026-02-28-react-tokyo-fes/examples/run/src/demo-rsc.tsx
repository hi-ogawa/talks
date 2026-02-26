import { createFromReadableStream, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import { logSection, stringToString } from "./utils";

export async function main() {
  async function ServerComponent() {
    return (
      <div>
        <span>{Math.random()}</span>
      </div>
    );
  }

  const rootNode = <ServerComponent />;
  logSection("Step 1/3", "Server Component Node", "React element on server environment");
  console.dir(rootNode);
  console.log();

  const rscStream = renderToReadableStream(rootNode);
  const [rscStream1, rscStream2] = rscStream.tee();
  logSection("Step 2/3", "RSC Stream Payload", "renderToReadableStream output");
  console.log(await stringToString(rscStream1));
  console.log();

  const rootNodeClient = await createFromReadableStream(rscStream2);
  logSection("Step 3/3", "Client React Node", "createFromReadableStream output");
  console.dir(rootNodeClient, { depth: null });
}
