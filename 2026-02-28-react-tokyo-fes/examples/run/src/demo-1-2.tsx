import {
  createClientTemporaryReferenceSet,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
} from "@vitejs/plugin-rsc/rsc";

function formDataEntries(fd: FormData) {
  return Array.from(fd.entries());
}

export async function main(args: string[]) {
  async function demoReply(args: any) {
    console.log("1️⃣  args (server function arguments)");
    console.dir(args, { depth: null });
    console.log();

    const encoderReferences = createClientTemporaryReferenceSet();
    const encoded = await encodeReply(args, { temporaryReferences: encoderReferences });
    console.log("2️⃣  encodeReply result (encoded arguments)");
    console.log(encoded);
    console.log();

    const decoderReferences = createTemporaryReferenceSet();
    const decoded = await decodeReply(encoded, { temporaryReferences: decoderReferences });
    console.log("3️⃣  decodeReply result (decoded arguments)");
    console.dir(decoded, { depth: null });
    if (decoded instanceof FormData) {
      console.log("FormData entries:", formDataEntries(decoded));
    }
    console.log();
  }

  const type = args[0] || "simple";
  if (type === "simple") {
    await demoReply([{ greet: "hi" }]);
  }
  if (type === "form") {
    const formData = new FormData();
    formData.set("greet", "hey");
    await demoReply(formData);
  }
}
