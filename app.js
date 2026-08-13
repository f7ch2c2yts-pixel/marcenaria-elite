const modules = {
  dashboard:{label:"Dashboard"},
  vendas:{label:"Vendas", fields:[["data","Data","date"],["cliente","Cliente"],["projeto","Descrição / Projeto"],["valor","Valor total","number"],["entrada","Entrada","number"],["forma","Forma de pagamento"],["status","Status","select",["Orçamento","Em andamento","Concluída","Cancelada"]],["prazo","Prazo de entrega","date"],["obs","Observações","textarea"]]},
  clientes:{label:"Clientes", fields:[["nome","Nome"],["cpf","CPF/CNPJ"],["telefone","Telefone"],["email","E-mail","email"],["cidade","Cidade"],["obs","Observações","textarea"]]},
  fornecedores:{label:"Fornecedores", fields:[["razao","Razão social"],["cnpj","CPF/CNPJ"],["telefone","Telefone"],["email","E-mail","email"],["categoria","Categoria"],["cidade","Cidade"],["obs","Observações","textarea"]]},
  receber:{label:"Contas a Receber", fields:[["vencimento","Vencimento","date"],["cliente","Cliente"],["venda","ID da venda"],["valor","Valor","number"],["recebido","Recebido","number"],["forma","Forma"],["status","Status","select",["Aberto","Parcial","Recebido","Atrasado"]]]},
  pagar:{label:"Contas a Pagar", fields:[["vencimento","Vencimento","date"],["fornecedor","Fornecedor"],["descricao","Descrição"],["valor","Valor","number"],["pago","Pago","number"],["forma","Forma"],["status","Status","select",["Aberto","Parcial","Pago","Atrasado"]]]},
  cheques:{label:"Cheques", fields:[["numero","Nº cheque"],["cliente","Cliente"],["venda","ID da venda"],["banco","Banco"],["valor","Valor","number"],["bompara","Bom para","date"],["status","Status","select",["Em carteira","Depositado","Compensado","Repassado","Devolvido"]],["fornecedor","Fornecedor (se repassado)"],["contapagar","Conta a pagar vinculada"],["obs","Observações","textarea"]]},
  caixa:{label:"Fluxo de Caixa", fields:[["data","Data","date"],["tipo","Tipo","select",["Entrada","Saída"]],["origem","Origem"],["descricao","Descrição"],["forma","Forma"],["valor","Valor","number"]]}
};
let current="dashboard";
const $=s=>document.querySelector(s);
const money=n=>Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const load=k=>JSON.parse(localStorage.getItem("elite_"+k)||"[]");
const save=(k,v)=>localStorage.setItem("elite_"+k,JSON.stringify(v));
const nav=$("#nav");
Object.entries(modules).forEach(([k,m])=>{let b=document.createElement("button");b.textContent=m.label;b.onclick=()=>{current=k;render()};b.dataset.k=k;nav.appendChild(b)});
function sum(k,f){return load(k).reduce((a,x)=>a+Number(x[f]||0),0)}
function dashboard(){
 const vendas=sum("vendas","valor"), rec=sum("receber","valor")-sum("receber","recebido"), pag=sum("pagar","valor")-sum("pagar","pago");
 const cx=load("caixa").reduce((a,x)=>a+(x.tipo==="Saída"?-1:1)*Number(x.valor||0),0);
 const ch=load("cheques");
 return `<div class="cards">
 <div class="card"><small>Total em vendas</small><strong>${money(vendas)}</strong></div>
 <div class="card"><small>A receber em aberto</small><strong>${money(rec)}</strong></div>
 <div class="card"><small>A pagar em aberto</small><strong>${money(pag)}</strong></div>
 <div class="card"><small>Saldo de caixa</small><strong>${money(cx)}</strong></div>
 <div class="card"><small>Cheques em carteira</small><strong>${ch.filter(x=>x.status==="Em carteira").length}</strong></div>
 <div class="card"><small>Cheques repassados</small><strong>${ch.filter(x=>x.status==="Repassado").length}</strong></div>
 <div class="card"><small>Cheques devolvidos</small><strong>${ch.filter(x=>x.status==="Devolvido").length}</strong></div>
 <div class="card"><small>Vendas concluídas</small><strong>${load("vendas").filter(x=>x.status==="Concluída").length}</strong></div></div>
 <div class="panel"><h3>Visão geral</h3><p>Cadastre clientes e fornecedores, lance vendas, contas, cheques e movimentações de caixa. O módulo de cheques mantém o vínculo cliente → venda → cheque → fornecedor → conta a pagar.</p></div>`;
}
function table(k){
 let rows=load(k), fields=modules[k].fields;
 let heads=fields.slice(0,6).map(f=>`<th>${f[1]}</th>`).join("");
 let body=rows.map((r,i)=>`<tr>${fields.slice(0,6).map(f=>`<td>${f[2]==="number"?money(r[f[0]]):r[f[0]]||""}</td>`).join("")}<td><button onclick="del('${k}',${i})">Excluir</button></td></tr>`).join("");
 return `<div class="panel"><div class="toolbar"><b>${modules[k].label}</b><span>${rows.length} registro(s)</span></div>${rows.length?`<div style="overflow:auto"><table><thead><tr>${heads}<th></th></tr></thead><tbody>${body}</tbody></table></div>`:`<div class="empty">Nenhum registro ainda. Toque em “+ Novo lançamento”.</div>`}</div>`;
}
function render(){
 $("#pageTitle").textContent=modules[current].label;
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.k===current));
 $("#newBtn").style.display=current==="dashboard"?"none":"block";
 $("#app").innerHTML=current==="dashboard"?dashboard():table(current);
}
window.del=(k,i)=>{let a=load(k);a.splice(i,1);save(k,a);render()}
$("#newBtn").onclick=()=>{
 let m=modules[current];$("#modalTitle").textContent="Novo — "+m.label;
 $("#fields").innerHTML=m.fields.map(f=>{
   let [key,label,type="text",opts]=f, control;
   if(type==="select") control=`<select name="${key}">${opts.map(o=>`<option>${o}</option>`).join("")}</select>`;
   else if(type==="textarea") control=`<textarea name="${key}" rows="3"></textarea>`;
   else control=`<input name="${key}" type="${type}" ${type==="number"?'step="0.01"':''}>`;
   return `<div class="field ${type==="textarea"?"full":""}"><label>${label}</label>${control}</div>`;
 }).join("");
 $("#modal").showModal();
}
$("#entryForm").addEventListener("submit",e=>{
 if(e.submitter?.value==="cancel") return;
 e.preventDefault(); let fd=new FormData(e.target), obj=Object.fromEntries(fd.entries());
 obj.id=Date.now(); let a=load(current);a.push(obj);save(current,a);$("#modal").close();e.target.reset();render();
});
render();