/* Coursekit text helpers: lesson parser and a small Markdown renderer.
   Shared by the app (browser) and the pack tools (Node). No dependencies. */
(function(root){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function parseLessons(txt){
  const out=[];let cur=null,mode="body",item=null;
  const lines=txt.replace(/\r/g,"").split("\n");
  let i=0;
  function pushItem(){if(item&&cur){cur.practice.push(item);}item=null;}
  while(i<lines.length){
    const ln=lines[i];
    if(ln.startsWith("=== ")){
      pushItem();
      const p=ln.slice(4).split("|").map(s=>s.trim());
      cur={id:p[0],track:p[1],week:+p[2],title:p[3],drills:(p[4]||"").split(",").map(s=>s.trim()).filter(Boolean),sub:"",body:[],practice:[],recall:[]};
      out.push(cur);mode="body";i++;continue;
    }
    if(!cur){i++;continue;}
    if(ln.startsWith("@@ ")&&mode==="body"&&!cur.body.length){cur.sub=ln.slice(3);i++;continue;}
    if(ln.trim()==="--- practice"){mode="practice";i++;continue;}
    if(ln.trim()==="--- recall"){pushItem();mode="recall";i++;continue;}
    if(mode==="body"){cur.body.push(ln);i++;continue;}
    if(mode==="recall"){
      if(ln.startsWith("Q: ")){cur.recall.push({q:ln.slice(3),a:""});}
      else if(ln.startsWith("A: ")&&cur.recall.length){cur.recall[cur.recall.length-1].a=ln.slice(3);}
      else if(ln.trim()&&cur.recall.length){cur.recall[cur.recall.length-1].a+="\n"+ln;}
      i++;continue;
    }
    // practice
    const m=ln.match(/^@(predict|answer|choice|run|local|write)\s*$/);
    if(m){pushItem();item={type:m[1],prompt:[],expect:[],alts:[],opts:[],why:"",min:0};i++;continue;}
    if(!item){i++;continue;}
    const fence=ln.match(/^```(\w*)\s*$/);
    if(fence){
      const kind=fence[1];const buf=[];i++;
      while(i<lines.length&&!/^```\s*$/.test(lines[i])){buf.push(lines[i]);i++;}
      i++;
      const code=buf.join("\n");
      if(kind==="starter")item.starter=code;else if(kind==="test")item.test=code;else if(kind==="solution")item.solution=code;
      else item.prompt.push("```"+(kind||"")+"\n"+code+"\n```");
      continue;
    }
    if(ln.startsWith("=| ")){item.alts.push(ln.slice(3));}
    else if(ln.startsWith("= ")||ln==="="){item.expect.push(ln.slice(2));}
    else if(ln.startsWith("! ")){item.why+=(item.why?" ":"")+ln.slice(2);}
    else if(/^min: ?\d+/.test(ln)){item.min=+ln.replace(/\D/g,"");}
    else if(item.type==="choice"&&/^[-*] /.test(ln)){item.opts.push({t:ln.slice(2),ok:ln[0]==="*"});}
    else item.prompt.push(ln);
    i++;
  }
  pushItem();
  out.forEach(l=>{l.body=l.body.join("\n");l.practice.forEach(p=>p.prompt=p.prompt.join("\n").trim());});
  return out;
}

/* ---------- mini markdown ---------- */
function inline(s){
  s=esc(s);
  s=s.replace(/`([^`]+)`/g,(m,c)=>"<code>"+c+"</code>");
  s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,"$1<em>$2</em>");
  s=s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}
function md(src){
  const L=src.replace(/\r/g,"").split("\n");let h="",i=0;
  while(i<L.length){
    const ln=L[i];
    if(/^```/.test(ln)){const lang=ln.slice(3).trim();const b=[];i++;while(i<L.length&&!/^```\s*$/.test(L[i])){b.push(L[i]);i++;}i++;h+="<pre"+(lang?' data-lang="'+esc(lang)+'"':"")+"><code>"+esc(b.join("\n"))+"</code></pre>";continue;}
    if(ln.trim()==="$$"){const b=[];i++;while(i<L.length&&L[i].trim()!=="$$"){b.push(L[i]);i++;}i++;h+='<div class="formula">'+esc(b.join("\n"))+"</div>";continue;}
    if(/^### /.test(ln)){h+="<h3>"+inline(ln.slice(4))+"</h3>";i++;continue;}
    if(/^## /.test(ln)){h+="<h2>"+inline(ln.slice(3))+"</h2>";i++;continue;}
    if(/^> /.test(ln)){const b=[];while(i<L.length&&/^> ?/.test(L[i])&&L[i].trim()!==""){b.push(L[i].replace(/^> ?/,""));i++;}h+="<blockquote>"+b.map(x=>"<p>"+inline(x)+"</p>").join("")+"</blockquote>";continue;}
    if(/^\|/.test(ln)){const rows=[];while(i<L.length&&/^\|/.test(L[i])){rows.push(L[i]);i++;}
      const cells=r=>r.replace(/^\||\|\s*$/g,"").split("|").map(c=>c.trim());
      let t='<div class="tbl"><table>';rows.forEach((r,k)=>{if(/^\|[\s:-]+\|/.test(r)&&/-/.test(r)&&!/[a-z0-9]/i.test(r))return;const tag=k===0?"th":"td";t+="<tr>"+cells(r).map(c=>"<"+tag+">"+inline(c)+"</"+tag+">").join("")+"</tr>";});h+=t+"</table></div>";continue;}
    if(/^\s*[-*] /.test(ln)){const b=[];while(i<L.length&&/^\s*[-*] /.test(L[i])){b.push(L[i].replace(/^\s*[-*] /,""));i++;}h+="<ul>"+b.map(x=>"<li>"+inline(x)+"</li>").join("")+"</ul>";continue;}
    if(/^\d+\. /.test(ln)){const b=[];while(i<L.length&&/^\d+\. /.test(L[i])){b.push(L[i].replace(/^\d+\. /,""));i++;}h+="<ol>"+b.map(x=>"<li>"+inline(x)+"</li>").join("")+"</ol>";continue;}
    if(!ln.trim()){i++;continue;}
    const b=[];while(i<L.length&&L[i].trim()&&!/^(```|## |### |> |\||\s*[-*] |\d+\. |\$\$)/.test(L[i])){b.push(L[i]);i++;}
    h+="<p>"+inline(b.join(" "))+"</p>";
  }
  return h;
}

const api={esc,parseLessons,inline,md};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.CKText=api;
})(typeof window!=="undefined"?window:globalThis);
