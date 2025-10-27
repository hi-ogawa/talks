__vite_ssr_exportName__("default", () => { try { return __vite_ssr_export_default__ } catch {} });
const __vite_ssr_import_0__ = await __vite_ssr_import__("/@fs/home/hiroshi/code/personal/talks/2025-10-25/node_modules/.pnpm/vue@3.5.22_typescript@5.9.3/node_modules/vue/index.mjs", {"importedNames":["ref"]});
const __vite_ssr_import_1__ = await __vite_ssr_import__("/@fs/home/hiroshi/code/personal/talks/2025-10-25/node_modules/.pnpm/vue@3.5.22_typescript@5.9.3/node_modules/vue/server-renderer/index.mjs", {"importedNames":["ssrRenderAttr","ssrInterpolate"]});
const __vite_ssr_import_2__ = await __vite_ssr_import__("/@fs/home/hiroshi/code/personal/talks/2025-10-25/node_modules/.pnpm/vue@3.5.22_typescript@5.9.3/node_modules/vue/index.mjs", {"importedNames":["useSSRContext"]});
const __vite_ssr_import_3__ = await __vite_ssr_import__("/@id/__x00__plugin-vue:export-helper", {"importedNames":["default"]});


const _sfc_main = {
  __name: 'Hello',
  setup(__props, { expose: __expose }) {
  __expose();

const msg = (0,__vite_ssr_import_0__.ref)('Hello World!');

const __returned__ = { msg, ref: __vite_ssr_import_0__.ref };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};


function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><h1>${
    (0,__vite_ssr_import_1__.ssrInterpolate)($setup.msg)
  }</h1><input${
    (0,__vite_ssr_import_1__.ssrRenderAttr)("value", $setup.msg)
  }><!--]-->`)
}



const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = (0,__vite_ssr_import_2__.useSSRContext)()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/Hello.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};

const __vite_ssr_export_default__ = /*#__PURE__*/(0,__vite_ssr_import_3__.default)(_sfc_main, [['ssrRender',_sfc_ssrRender],['__file',"/home/hiroshi/code/personal/talks/2025-10-25/examples/vue-ssr/src/Hello.vue"]])
//# sourceMappingSource=vite-generated
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQTtBQUNBOzs7Ozs7Ozs7OztBQUNBLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFDLDBCQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs2Q0FJckIsVUFBRzs7cURBQ00sVUFBRyIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiSGVsbG8udnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgc2V0dXA+XG5pbXBvcnQgeyByZWYgfSBmcm9tICd2dWUnXG5jb25zdCBtc2cgPSByZWYoJ0hlbGxvIFdvcmxkIScpXG48L3NjcmlwdD5cblxuPHRlbXBsYXRlPlxuICA8aDE+e3sgbXNnIH19PC9oMT5cbiAgPGlucHV0IHYtbW9kZWw9XCJtc2dcIiAvPlxuPC90ZW1wbGF0ZT5cbiJdLCJmaWxlIjoiL3NyYy9IZWxsby52dWUifQ==

// {"id":"/home/hiroshi/code/personal/talks/2025-10-25/examples/vue-ssr/src/Hello.vue","file":"/home/hiroshi/code/personal/talks/2025-10-25/examples/vue-ssr/src/Hello.vue"}
