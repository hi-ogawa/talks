import {
  createClientTemporaryReferenceSet,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
} from "@vitejs/plugin-rsc/rsc";
import { logLhs, logSection } from "./utils";

export async function main(args: string[]) {
  async function demoReply(args: any) {
    logSection("Step 1/3", "Server Function Arguments");
    if (args instanceof FormData) {
      logLhs("args", formDataEntries(args));
    } else {
      logLhs("args", args);
    }
    console.log();

    const encoderReferences = createClientTemporaryReferenceSet();
    const body = await encodeReply(args, { temporaryReferences: encoderReferences });
    logSection("Step 2/3", "encodeReply Result");
    logLhs("body", body);
    console.log();

    const decoderReferences = createTemporaryReferenceSet();
    const decoded = await decodeReply(body, { temporaryReferences: decoderReferences });
    logSection("Step 3/3", "decodeReply Result");
    if (decoded instanceof FormData) {
      logLhs("args", formDataEntries(decoded));
    } else {
      logLhs("args", decoded);
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
  return Object.fromEntries(Array.from(fd.entries()));
}
