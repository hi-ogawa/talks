import {
  createClientTemporaryReferenceSet,
  createFromReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";

async function demo1() {
  async function ServerComponent() {
    return (
      <div>
        <span>{Math.random()}</span>
      </div>
    );
  }

  const rootNode = <ServerComponent />;
  console.log("==== React tree (server) ====");
  console.dir(rootNode);
  console.log();

  const rscStream = renderToReadableStream(rootNode);
  const [rscStream1, rscStream2] = rscStream.tee();
  console.log("==== RSC stream ====");
  console.log(await stringToString(rscStream1));
  console.log();

  const rootNodeClient = await createFromReadableStream(rscStream2);
  console.log("==== React tree (client) ====");
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

function formDataEntries(fd: FormData) {
  return Array.from(fd.entries());
}

async function demo2() {
  async function demoReply(reply: any) {
    console.log("==== Reply (original) ====");
    console.dir(reply, { depth: null });
    console.log();

    const encoderReferences = createClientTemporaryReferenceSet();
    const encoded = await encodeReply(reply, { temporaryReferences: encoderReferences });
    console.log("==== encodeReply ====");
    console.log(encoded);
    console.log();

    const decoderReferences = createTemporaryReferenceSet();
    const decoded = await decodeReply(encoded, { temporaryReferences: decoderReferences });
    console.log("==== decodeReply ====");
    console.dir(decoded, { depth: null });
    if (decoded instanceof FormData) {
      console.log("FormData entries:", formDataEntries(decoded));
    }
    console.log();
  }

  await demoReply([{ foo: "bar", count: 42 }]);

  // FormData itself is encded as FormData
  const formData = new FormData();
  formData.set("name", "Alice");
  formData.set("age", "30");
  await demoReply(formData);
}

async function demo3() {
  const reply = [{ children: <div>dynamic</div> }];
  console.log("==== Reply (original) ====");
  console.dir(reply, { depth: null });
  console.log();

  const encoderReferences = createClientTemporaryReferenceSet();
  const encoded = await encodeReply(reply, { temporaryReferences: encoderReferences });
  console.log("==== encodeReply ====");
  console.log(encoded);
  console.log();

  const decoderReferences = createTemporaryReferenceSet();
  const decoded = await decodeReply(encoded, { temporaryReferences: decoderReferences });
  console.log("==== decodeReply ====");
  console.dir(decoded, { depth: null });
  console.log();

  const rscStream = renderToReadableStream(decoded, { temporaryReferences: decoderReferences });
  const [rscStream1, rscStream2] = rscStream.tee();
  console.log("==== RSC stream ====");
  console.log(await stringToString(rscStream1));
  console.log();

  const revived = await createFromReadableStream(rscStream2, {
    temporaryReferences: encoderReferences,
  });
  console.log("==== Revived ====");
  console.dir(revived, { depth: null });
}

async function demo4() {
  // "use cache" component: static shell + dynamic children
  function CachedParent({ children, message }: { children: React.ReactNode; message: string }) {
    return (
      <>
        <span>static: {Date.now()}</span>
        <span>message: {message}</span>
        {children}
      </>
    );
  }

  // Dynamic child component
  function DynamicChild() {
    return <span>dynamic: {Date.now()}</span>;
  }

  // Simulate calling: <CachedParent message="hello"><DynamicChild /></CachedParent>
  const args = [{ message: "hello", children: <DynamicChild /> }];

  console.log("==== 1. Original args ====");
  console.dir(args, { depth: null });
  console.log();

  // Step 1: Encode args (for cache key)
  const clientTempRefs = createClientTemporaryReferenceSet();
  const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });
  console.log("==== 2. encodeReply (cache key) ====");
  console.log(encodedArgs);
  console.log("→ children becomes $T, message stays as 'hello'");
  console.log();

  // Step 2: Decode args (on cache miss, to execute fn)
  const serverTempRefs = createTemporaryReferenceSet();
  const decodedArgs: any[] = await decodeReply(encodedArgs, {
    temporaryReferences: serverTempRefs,
  });
  console.log("==== 3. decodeReply (to execute fn) ====");
  console.dir(decodedArgs, { depth: null });
  console.log();

  // Step 3: Execute the cached function (this is the "fn" in use-cache-runtime)
  const result = CachedParent(decodedArgs[0] as any);
  console.log("==== 4. CachedParent(decoded) - fn result ====");
  console.dir(result, { depth: null });
  console.log();

  // Step 4: Serialize result (for cache value)
  const rscStream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
  const [stream1, stream2] = rscStream.tee();
  const rscPayload = await stringToString(stream1);
  console.log("==== 5. renderToReadableStream (cache value) ====");
  console.log(rscPayload);
  console.log("→ static Date.now() is baked in, children becomes $T0");
  console.log();

  // Step 5: Revive from cache (on cache hit)
  const revived = await createFromReadableStream(stream2, {
    temporaryReferences: clientTempRefs,
  });
  console.log("==== 6. createFromReadableStream (revived) ====");
  console.dir(revived, { depth: null });
  console.log("→ <DynamicChild /> is restored from temporaryReferences!");
}

export async function main(args: string[]) {
  const command = args[0] || "demo1";
  const demoFn = { demo1, demo2, demo3, demo4 }[command];
  if (!demoFn) {
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
    return;
  }
  await demoFn();
}
