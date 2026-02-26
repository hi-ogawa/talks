import {
  createClientTemporaryReferenceSet,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
} from "@vitejs/plugin-rsc/rsc";
import { logSection } from "./utils";

export async function main(args: string[]) {
  async function demoReply(args: any) {
    logSection("Step 1/3", "Server Function Arguments", "input before encoding");
    console.dir(args, { depth: null });
    if (args instanceof FormData) {
      console.log("FormData entries:", formDataEntries(args));
    }
    console.log();

    const encoderReferences = createClientTemporaryReferenceSet();
    const encoded = await encodeReply(args, { temporaryReferences: encoderReferences });
    logSection("Step 2/3", "encodeReply Result", "encoded arguments payload");
    console.log(encoded);
    console.log();

    const decoderReferences = createTemporaryReferenceSet();
    const decoded = await decodeReply(encoded, { temporaryReferences: decoderReferences });
    logSection("Step 3/3", "decodeReply Result", "decoded arguments payload");
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

function formDataEntries(fd: FormData) {
  return Array.from(fd.entries());
}
