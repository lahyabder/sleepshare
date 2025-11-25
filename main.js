function generateSerenityIndex() {
  return Math.floor(50 + Math.random() * 50); // بين 50 و 100
}

function generateDreamSignature(room) {
  const dictionaries = {
    Wave: ["Wave", "Tide", "Azure"],
    Stone: ["Stone", "Basalt", "IronShade"],
    Cloud: ["Cloud", "Mist", "Vapor"],
    Echo: ["Echo", "MemoryLine", "Hollow"],
    Light: ["Light", "Dawn", "Halo"],
    Drift: ["Drift", "Wander", "Float"],
    Focus: ["Focus", "ClearTone", "Prism"],
    Ease: ["Ease", "SoftAir", "Velvet"]
  };

  const base = dictionaries[room] || ["Dream"];
  const word = base[Math.floor(Math.random() * base.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${word}-${number}`;
}

function poeticSerenityDescription(score) {
  if (score >= 90) return "سكونٌ صافٍ يهبّ على روحك كنسيم فجرٍ بعيد.";
  if (score >= 75) return "موجة هادئة مرّت بك، وهناك سلام يلمع تحت جلد الليل.";
  if (score >= 55) return "ظلال خفيفة كانت حولك، لكن القلب ظل ثابتًا.";
  if (score >= 30) return "كانت الليلة مثل ممر طويل… خطواتك كانت ثقيلة.";
  return "كأن النوم كان بعيدًا عنك… لكن هذا جزء من الرحلة.";
}
