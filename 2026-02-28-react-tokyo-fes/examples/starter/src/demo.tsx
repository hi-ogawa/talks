import { createFromReadableStream, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";

async function ServerComponent() {
  return (
    <div>
      <span>{Math.random()}</span>
    </div>
  );
}

export async function main() {
  const rootNode = <ServerComponent />;
  console.log("==== React tree (server) ====");
  console.dir(rootNode);
  console.log();

  const rscStream = renderToReadableStream(rootNode);
  const [rscStream1, rscStream2] = rscStream.tee();
  console.log("==== RSC stream ====");
  await rscStream1.pipeThrough(new TextDecoderStream() as any).pipeTo(
    new WritableStream({
      write(chunk) {
        console.log(chunk);
      },
    }),
  );
  console.log();

  const rootNodeClient = await createFromReadableStream(rscStream2);
  console.log("==== React tree (client) ====");
  console.dir(rootNodeClient, { depth: null });
}
