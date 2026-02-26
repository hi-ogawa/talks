import { createFromReadableStream, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";

export async function main() {
  async function ServerComponent() {
    return (
      <div>
        <span>{Math.random()}</span>
      </div>
    );
  }

  const rootNode = <ServerComponent />;
  console.log("1️⃣  <ServerComponent /> (React node on react server environment)");
  console.dir(rootNode);
  console.log();

  const rscStream = renderToReadableStream(rootNode);
  const [rscStream1, rscStream2] = rscStream.tee();
  console.log("2️⃣  RSC stream (renderToReadableStream result)");
  console.log(await stringToString(rscStream1));
  console.log();

  const rootNodeClient = await createFromReadableStream(rscStream2);
  console.log("3️⃣  React node on client environment (createFromReadableStream result)");
  console.dir(rootNodeClient, { depth: null });
}

async function stringToString(stream: ReadableStream<Uint8Array>) {
  let result = "";
  await stream.pipeThrough(new TextDecoderStream() as any).pipeTo(
    new WritableStream({
      write(chunk) {
        result += chunk;
      },
    }),
  );
  return result;
}
