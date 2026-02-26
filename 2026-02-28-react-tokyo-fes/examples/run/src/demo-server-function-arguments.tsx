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
    if (args instanceof FormData) {
      console.log("FormData", formDataEntries(args));
    } else {
      console.dir(args, { depth: null });
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
    if (decoded instanceof FormData) {
      console.log("FormData", formDataEntries(decoded));
    } else {
       console.dir(decoded, { depth: null });
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
  return Object.fromEntries(Array.from(fd.entries()))
}
