interface Tool { name:string; description:string; inputSchema:object; annotations:{readOnlyHint:boolean}; execute:(input:unknown)=>unknown }
interface ModelContext { registerTool:(tool:Tool,options?:{signal:AbortSignal})=>void|Promise<void> }
export function registerTools(tools:Tool[]){
  const context=(document as Document & {modelContext?:ModelContext}).modelContext || (navigator as Navigator & {modelContext?:ModelContext}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
