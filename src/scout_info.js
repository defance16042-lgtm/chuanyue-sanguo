// 戰鬥敵將偵察面板：多分頁顯示既有戰鬥資料，不修改回合狀態。
(function () {
  window.ScoutInfoRenderer = function (c, scene, t) {
    const D = window.DATA, B = D.battle, pg = scene.scoutPage || 0;
    const tabs = ['人物','能力','裝備','敵將計謀','軍師','兵種陣形','戰場狀態','應對'];
    const terrain = Object.keys(D.terrainNames || {}).map(k => D.terrainNames[k]+':'+((t.terr&&t.terr[k])||'B')).join('　');
    const ids = Array.isArray(t.eSkills)?t.eSkills:(t.eSkills?[t.eSkills]:[]);
    const skills = ids.map(x=>{const id=Array.isArray(x)?x[x.length-1]:x,s=B.skills[id];if(!s)return String(id);const kind=({phys:'武技',tact:'計謀',buff:'增益',debuff:'削弱',confuse:'混亂',heal:'回復',dot:'持續傷害',stun:'暈眩',taunt:'叫陣'})[s.kind]||s.kind;return s.name+'（'+kind+'／TP'+(s.tp==null?'不耗':s.tp)+(s.power?'／倍率'+s.power:'')+(s.turns?'／'+s.turns+'回合':'')+'）';});
    const advisor=t.strategist||t.advisor||t.militaryAdvisor;
    const buffs=Object.keys(t.buffs||{}).map(k=>{const v=t.buffs[k];return k+(v&&v.mult?(v.mult>1?'提升':'降低')+Math.round(Math.abs(v.mult-1)*100)+'%':'')+(v&&v.turns?'剩'+v.turns+'回合':'');});
    if(t.confused>0)buffs.push('混亂'+t.confused+'回合'); if(t.stun>0)buffs.push('暈眩'+t.stun+'回合'); if(t.taunt>0)buffs.push('叫陣'+t.taunt+'回合'); if(t.defending)buffs.push('防禦中');
    const pages=[
      ['人物情報','姓名：'+t.name,'稱號：'+(t.title||'未設定'),'身分：'+(t.cls||'未設定'),'兵器：'+(t.weapon||'未設定'),'身勢／背景：'+(t.desc||'尚無人物描述'),'來源：遊戲既有敵將資料'],
      ['能力值','兵力：'+scene.H(t)+'/'+t.hpMax,'武力：'+(t.atk||0)+'　攻擊：'+((t.atk||0)*2+(t.pow||0)),'防禦：'+(t.def||0),'智力：'+(t.int||0)+'　速度：'+(t.spd||0),'統率：'+(t.lead||0)+'　運氣：'+(t.luck||0),'敵方戰術點：'+(t.tp==null?'未設定':t.tp)],
      ['裝備情報','武器類型：'+(t.weapon||'未設定'),'兵種：'+(t.cls||'未設定'),'獨立裝備槽：'+(t.equip?'有配置':'目前敵將資料未配置'),'裝備加成：'+(t.equip?'讀取既有裝備欄位':'未提供，不推測'),'注意：掉落物不等於敵將身上裝備。'],
      ['敵將本人計謀','AI 類型：'+(t.ai||'普通'),'特殊技能：'+(skills.length?skills.join('、'):'未配置 eSkills'),...(t.ai==='boss'?['頭目招式：全軍衝鋒（25% 機率）','頭目招式：重斬（15% 機率，未防禦時）']:[]),'一般敵將若配置 eSkills，依既有技能資料顯示。','本頁只列敵將本人，不混入軍師計謀。'],
      ['軍師情報','隨軍軍師：'+(advisor?(advisor.name||advisor.id||advisor):'敵將資料未配置軍師'),'軍師智力：'+(advisor&&advisor.int!=null?advisor.int:'未提供'),'軍師計謀：'+(advisor&&advisor.skills?advisor.skills.join('、'):'未配置獨立軍師計謀'),'不補造未配置的人物、能力或計謀。'],
      ['兵種／陣形','兵種：'+(t.cls||'未設定'),'地形適性：'+terrain,'敵方陣形：'+(t.formation||'未配置'),'主將／頭目：'+(t.boss?'是':'否'),'部隊編制：依本場敵軍資料。'],
      ['戰場狀態','目前兵力：'+scene.H(t)+'/'+t.hpMax,'狀態：'+(buffs.length?buffs.join('、'):'無已記錄狀態'),'位置：敵方第'+((t.row||0)+1)+'列','已倒下：'+(scene.H(t)<=0?'是':'否'),'弱點／抗性：'+(t.weakness||t.resist||'尚未配置資料')],
      ['應對摘要',t.boss?'頭目敵將：留意特殊行動與技能。':'一般敵軍：依兵力與能力值判斷威脅。','特殊技能：'+(skills.length?skills.join('、'):'未記錄'),'參考地形適性選擇戰術。','優先處理已顯示的異常／增益狀態。','此為資料提示，不代表確定勝率。']
    ];
    c.fillStyle='rgba(4,7,20,0.97)';c.fillRect(4,4,248,216);window.Engine.panel(c,4,4,248,216);
    window.Engine.text(c,'敵將偵察：'+t.name,12,10,{size:10,color:'#ffd668'});
    window.Engine.text(c,(pg+1)+'/'+pages.length+'　左右／Z 翻頁　上下換敵將　X 返回',244,11,{size:6,color:'#8a8aa0',align:'right'});
    tabs.forEach((n,i)=>{const x=12+i*29;window.Engine.text(c,n,x,25,{size:7,color:i===pg?'#ffd668':'#8a8aa0'});if(i===pg){c.fillStyle='#ffd668';c.fillRect(x,34,Math.min(26,n.length*7),1);}});
    const lines=[];pages[pg].forEach(s=>{for(let i=0;i<s.length;i+=27)lines.push(s.slice(i,i+27));});
    lines.slice(0,11).forEach((line,i)=>window.Engine.text(c,line,12,44+i*13,{size:8,color:i===0?'#9ef59e':'#f4f4ff'}));
    window.Engine.text(c,'偵察不消耗回合；缺漏資料會明確標示。',12,204,{size:7,color:'#8a8aa0'});
  };
})();