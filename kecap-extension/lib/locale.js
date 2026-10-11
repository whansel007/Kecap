(function (root) {
  'use strict';

  const messages = {
    id: {
      'Settings':'Pengaturan','Images':'Gambar','Scratchpad':'Papan latihan','Aksara Sunda quick reference':'Referensi cepat Aksara Sunda','On-screen keyboard':'Papan ketik Aksara Sunda','Open on-screen Aksara Sunda keyboard':'Buka papan ketik Aksara Sunda','Open settings':'Buka pengaturan',
      'Hover a word to see its Latin original; right-click for more details.':'Arahkan kursor ke kata untuk melihat tulisan Latinnya; klik kanan untuk detail.',
      'Page text is processed on this device. Requested image OCR fetches from the source and runs locally.':'Teks halaman diproses di perangkat ini. OCR gambar mengambil gambar dari sumbernya dan berjalan secara lokal.',
      'Translate images':'Ubah tulisan pada gambar','Restore originals':'Kembalikan gambar asli','Or right-click any image.':'Atau klik kanan pada gambar.',
      'Type Latin text…':'Ketik teks Latin…','Copy':'Salin','Consonants provide a base syllable (for example,':'Konsonan membentuk suku kata dasar (misalnya,',
      ' is sa). Rarangken modify that sound; pamaéh removes the vowel.':' adalah sa). Rarangken mengubah bunyinya; pamaéh menghilangkan vokal.',
      'Consonants provide a base syllable (for example, ᮞ is sa). Rarangken modify that sound; pamaéh removes the vowel.':'Konsonan membentuk suku kata dasar (misalnya, ᮞ adalah sa). Rarangken mengubah bunyinya; pamaéh menghilangkan vokal.',
      'Aksara Ngalagena · consonants':'Aksara Ngalagena · konsonan','Aksara Swara · independent vowels':'Aksara Swara · vokal mandiri',
      'Rarangken · vowel marks':'Rarangken · tanda vokal','Final and medial signs':'Tanda akhir dan tengah','Angka · digits':'Angka · digit',
      'Conto · examples from the chart':'Contoh dari bagan','Keyboard layout':'Tata letak papan ketik','Group similar-looking Aksara':'Kelompokkan aksara yang mirip',
      'Alphabetical':'Menurut abjad','Alphabetical + vowels together':'Abjad + vokal bersama','Custom · drag to arrange':'Kustom · seret untuk menyusun',
      'Automatically rewrite pages':'Ubah tulisan halaman secara otomatis','Rewrite this page in Aksara Sunda':'Ubah halaman ini ke Aksara Sunda',
      'Store Latin text, display Aksara':'Simpan teks Latin, tampilkan Aksara','Websites receive Latin text while fields display its Aksara Sunda transliteration.':'Situs menerima teks Latin, sementara kolom menampilkan alih aksara Sunda.',
      'Keyboard shortcut':'Pintasan papan ketik','Reset':'Atur ulang','Click the shortcut, then press a key combination. Use at least one modifier (Ctrl, Alt, or Shift).':'Klik pintasan, lalu tekan kombinasi tombol. Gunakan setidaknya satu tombol pengubah (Ctrl, Alt, atau Shift).',
      'Press the new key combination… (Esc cancels)':'Tekan kombinasi tombol baru… (Esc membatalkan)','Press keys…':'Tekan tombol…','Add Ctrl, Alt, or Shift to the shortcut.':'Tambahkan Ctrl, Alt, atau Shift ke pintasan.',
      'Image OCR language':'Bahasa OCR gambar','Indonesian/Sundanese':'Indonesia/Sunda','English':'Inggris','Image text is recognized on this device, then transliterated by spelling. No image is sent to a provider; clear, large text works best.':'Tulisan pada gambar dikenali di perangkat ini, lalu dialihaksarakan berdasarkan ejaan. Gambar tidak dikirim ke layanan lain; teks besar dan jelas memberi hasil terbaik.',
      'Convert digits':'Ubah angka','Spelling-based transliteration, not translation; edge cases may differ from Aksara Sunda Baku.':'Alih aksara berdasarkan ejaan, bukan terjemahan; beberapa bentuk dapat berbeda dari Aksara Sunda Baku.',
      'Hover a word to see its Latin original; right-click for more details.':'Arahkan kursor ke kata untuk melihat tulisan Latinnya; klik kanan untuk detail.',
      'Interface language':'Bahasa antarmuka','English (default)':'Inggris (bawaan)','Bahasa Indonesia':'Bahasa Indonesia','Basa Sunda':'Basa Sunda',
      'Aksara Sunda keyboard':'Papan ketik Aksara Sunda','Drag to move · Tab / Shift+Tab switches tabs · W A S D or arrows · tap Right Shift to select · Esc closes':'Seret untuk memindahkan · Tab / Shift+Tab mengganti tab · W A S D atau tombol panah · tekan Shift kanan untuk memilih · Esc menutup',
      'Close keyboard':'Tutup papan ketik','Consonants':'Konsonan','Signs':'Tanda','Digits':'Angka','Layout':'Tata letak','Similar shapes':'Bentuk serupa','Alphabetical + vowels':'Abjad + vokal','Custom · drag to arrange':'Kustom · seret untuk menyusun',
      'Drag and drop keys to arrange them.':'Seret tombol untuk menyusunnya.','⌫ Backspace':'⌫ Hapus','Space':'Spasi','Choose the syllable for {word}':'Pilih suku kata untuk {word}','Rarangken':'Rarangken',
      'Text field active':'Kolom teks aktif','Click a text field first':'Klik kolom teks terlebih dahulu','Choose any rarangken first, then choose a vowel. The vowel ends the syllable selection.':'Pilih rarangken terlebih dahulu, lalu pilih vokal. Pilihan suku kata berakhir setelah memilih vokal.',
      'Choose a consonant, add any rarangken, then choose a vowel. The vowel ends the syllable selection.':'Pilih konsonan, tambahkan rarangken, lalu pilih vokal. Pilihan suku kata berakhir setelah memilih vokal.',
      'Rarangken and signs':'Rarangken dan tanda','Choose a sign to add it to your text.':'Pilih tanda untuk menambahkannya ke teks.','Aksara Sunda digits':'Angka Aksara Sunda','Choose a digit to add it to your text.':'Pilih angka untuk menambahkannya ke teks.',
      'How the sounds are written':'Cara penulisan bunyi','Sundanese digit {number}':'Angka Sunda {number}','This Aksara Sunda numeral represents {number}.':'Angka Aksara Sunda ini melambangkan {number}.',
      'is independent a':'adalah vokal mandiri a','is independent i':'adalah vokal mandiri i','is independent u':'adalah vokal mandiri u','is independent é':'adalah vokal mandiri é','is independent o':'adalah vokal mandiri o','is independent e (pepet)':'adalah vokal mandiri e (pepet)','is independent eu':'adalah vokal mandiri eu',
      'Panyecek marks final ng':'Panyecek menandai ng di akhir','Panglayar marks final r':'Panglayar menandai r di akhir','Pangwisad marks final h':'Pangwisad menandai h di akhir','Pamingkal adds medial y':'Pamingkal menambahkan y di tengah','Panyakra adds medial r':'Panyakra menambahkan r di tengah','Panyiku adds medial l':'Panyiku menambahkan l di tengah',
      'Panghulu changes the vowel to i':'Panghulu mengubah vokal menjadi i','Panyuku changes the vowel to u':'Panyuku mengubah vokal menjadi u','Panéléng changes the vowel to é':'Panéléng mengubah vokal menjadi é','Panolong changes the vowel to o':'Panolong mengubah vokal menjadi o','Pamepet changes the vowel to e':'Pamepet mengubah vokal menjadi e','Paneuleung changes the vowel to eu':'Paneuleung mengubah vokal menjadi eu','Pamaéh removes the vowel':'Pamaéh menghilangkan vokal',
      'Kécap can\'t run on this page.':'Kécap tidak dapat berjalan di halaman ini.','Image translation started.':'Pemrosesan gambar dimulai.','Copied.':'Tersalin.','Could not copy.':'Tidak dapat menyalin.','Only HTTP, HTTPS, and data images are supported.':'Hanya gambar HTTP, HTTPS, dan data yang didukung.','No readable text was found in this image. Try a larger, clearer image.':'Tidak ada teks yang terbaca pada gambar. Coba gambar yang lebih besar dan jelas.','Image processing failed.':'Pemrosesan gambar gagal.','This Chrome version does not support local OCR.':'Versi Chrome ini tidak mendukung OCR lokal.','Local OCR is unavailable. Reload Kécap and try again.':'OCR lokal tidak tersedia. Muat ulang Kécap lalu coba lagi.',
      'Image not found.':'Gambar tidak ditemukan.','This image is already processing.':'Gambar ini sedang diproses.','Rewriting image…':'Mengubah tulisan pada gambar…','Image could not be translated.':'Tulisan pada gambar tidak dapat dialihaksarakan.','Could not display translated image.':'Hasil gambar tidak dapat ditampilkan.','Aksara Sunda font not loaded: see README':'Fon Aksara Sunda tidak dimuat: lihat README','Original ↔ Aksara Sunda':'Asli ↔ Aksara Sunda'
    },
    su: {
      'Settings':'Setélan','Images':'Gambar','Scratchpad':'Papan latihan','Aksara Sunda quick reference':'Rujukan ringkes Aksara Sunda','On-screen keyboard':'Kibor Aksara Sunda','Open on-screen Aksara Sunda keyboard':'Buka kibor Aksara Sunda','Open settings':'Buka setélan',
      'Hover a word to see its Latin original; right-click for more details.':'Séréd kursor kana kecap pikeun ningali tulisan Latinna; klik katuhu pikeun katerangan.',
      'Page text is processed on this device. Requested image OCR fetches from the source and runs locally.':'Téks kaca diolah dina ieu pakakas. OCR gambar nyokot gambar tina sumberna sarta diolah sacara lokal.',
      'Translate images':'Alihaksarakeun gambar','Restore originals':'Balikkeun gambar aslina','Or right-click any image.':'Atawa klik katuhu dina gambar.',
      'Type Latin text…':'Ketik téks Latin…','Copy':'Salin','Consonants provide a base syllable (for example,':'Konsonan jadi dasar engang (upamana,',
      ' is sa). Rarangken modify that sound; pamaéh removes the vowel.':' téh sa). Rarangken ngarobah sorana; pamaéh mupus vokalna.',
      'Consonants provide a base syllable (for example, ᮞ is sa). Rarangken modify that sound; pamaéh removes the vowel.':'Konsonan jadi dasar engang (upamana, ᮞ téh sa). Rarangken ngarobah sorana; pamaéh mupus vokalna.',
      'Aksara Ngalagena · consonants':'Aksara Ngalagena · konsonan','Aksara Swara · independent vowels':'Aksara Swara · vokal mandiri',
      'Rarangken · vowel marks':'Rarangken · tanda vokal','Final and medial signs':'Tanda tungtung jeung tengah','Angka · digits':'Angka · wilangan',
      'Conto · examples from the chart':'Conto tina bagan','Keyboard layout':'Rarancang kibor','Group similar-looking Aksara':'Kumpulkeun aksara nu rupana sarupa',
      'Alphabetical':'Nurutan abjad','Alphabetical + vowels together':'Abjad + vokal dihijikeun','Custom · drag to arrange':'Khusus · sered pikeun ngatur',
      'Automatically rewrite pages':'Otomatis ngarobah tulisan kaca','Rewrite this page in Aksara Sunda':'Robah kaca ieu kana Aksara Sunda',
      'Store Latin text, display Aksara':'Simpen téks Latin, témbongkeun Aksara','Websites receive Latin text while fields display its Aksara Sunda transliteration.':'Situs narima téks Latin, ari kotak téks mintonkeun alihaksara Sundana.',
      'Keyboard shortcut':'Potong kompas kibor','Reset':'Setél deui','Click the shortcut, then press a key combination. Use at least one modifier (Ctrl, Alt, or Shift).':'Klik potong kompas, tuluy pencét kombinasi tombol. Paké sahenteuna hiji tombol pangrobah (Ctrl, Alt, atawa Shift).',
      'Press the new key combination… (Esc cancels)':'Pencét kombinasi tombol anyar… (Esc pikeun ngabatalkeun)','Press keys…':'Pencét tombol…','Add Ctrl, Alt, or Shift to the shortcut.':'Tambahkeun Ctrl, Alt, atawa Shift kana potong kompas.',
      'Image OCR language':'Basa OCR gambar','Indonesian/Sundanese':'Indonesia/Sunda','English':'Inggris','Image text is recognized on this device, then transliterated by spelling. No image is sent to a provider; clear, large text works best.':'Tulisan dina gambar dibaca ku ieu pakakas, tuluy dialihaksarakeun nurutkeun éjahan. Gambar teu dikirim ka panyadia; tulisan nu gedé tur écés leuwih hadé.',
      'Convert digits':'Robah angka','Spelling-based transliteration, not translation; edge cases may differ from Aksara Sunda Baku.':'Alihaksara dumasar kana éjahan, lain tarjamahan; sababaraha wangun bisa béda ti Aksara Sunda Baku.',
      'Interface language':'Basa antarbeungeut','English (default)':'Inggris (baku)','Bahasa Indonesia':'Basa Indonesia','Basa Sunda':'Basa Sunda',
      'Aksara Sunda keyboard':'Kibor Aksara Sunda','Drag to move · Tab / Shift+Tab switches tabs · W A S D or arrows · tap Right Shift to select · Esc closes':'Sered pikeun mindahkeun · Tab / Shift+Tab pindah tab · W A S D atawa tombol panah · pencét Shift katuhu pikeun milih · Esc nutup',
      'Close keyboard':'Tutup kibor','Consonants':'Konsonan','Signs':'Tanda','Digits':'Angka','Layout':'Rarancang','Similar shapes':'Rupa sarupa','Alphabetical + vowels':'Abjad + vokal','Custom · drag to arrange':'Khusus · sered pikeun ngatur',
      'Drag and drop keys to arrange them.':'Sered tombol pikeun ngatur tempatna.','⌫ Backspace':'⌫ Pupus','Space':'Spasi','Choose the syllable for {word}':'Pilih engang pikeun {word}','Rarangken':'Rarangken',
      'Text field active':'Kotak téks aktip','Click a text field first':'Klik heula dina kotak téks','Choose any rarangken first, then choose a vowel. The vowel ends the syllable selection.':'Pilih rarangken heula, tuluy pilih vokal. Pilihan engang réngsé sanggeus milih vokal.',
      'Choose a consonant, add any rarangken, then choose a vowel. The vowel ends the syllable selection.':'Pilih konsonan, tambahkeun rarangken, tuluy pilih vokal. Pilihan engang réngsé sanggeus milih vokal.',
      'Rarangken and signs':'Rarangken jeung tanda','Choose a sign to add it to your text.':'Pilih tanda pikeun nambahkeun kana téks.','Aksara Sunda digits':'Angka Aksara Sunda','Choose a digit to add it to your text.':'Pilih angka pikeun nambahkeun kana téks.',
      'How the sounds are written':'Kumaha sora dituliskeun','Sundanese digit {number}':'Angka Sunda {number}','This Aksara Sunda numeral represents {number}.':'Ieu angka Aksara Sunda ngalambangkeun {number}.',
      'is independent a':'nyaéta vokal mandiri a','is independent i':'nyaéta vokal mandiri i','is independent u':'nyaéta vokal mandiri u','is independent é':'nyaéta vokal mandiri é','is independent o':'nyaéta vokal mandiri o','is independent e (pepet)':'nyaéta vokal mandiri e (pepet)','is independent eu':'nyaéta vokal mandiri eu',
      'Panyecek marks final ng':'Panyecek nandaan ng di tungtung','Panglayar marks final r':'Panglayar nandaan r di tungtung','Pangwisad marks final h':'Pangwisad nandaan h di tungtung','Pamingkal adds medial y':'Pamingkal nambahkeun y di tengah','Panyakra adds medial r':'Panyakra nambahkeun r di tengah','Panyiku adds medial l':'Panyiku nambahkeun l di tengah',
      'Panghulu changes the vowel to i':'Panghulu ngarobah vokal jadi i','Panyuku changes the vowel to u':'Panyuku ngarobah vokal jadi u','Panéléng changes the vowel to é':'Panéléng ngarobah vokal jadi é','Panolong changes the vowel to o':'Panolong ngarobah vokal jadi o','Pamepet changes the vowel to e':'Pamepet ngarobah vokal jadi e','Paneuleung changes the vowel to eu':'Paneuleung ngarobah vokal jadi eu','Pamaéh removes the vowel':'Pamaéh mupus vokalna',
      'Kécap can\'t run on this page.':'Kécap teu bisa dijalankeun dina kaca ieu.','Image translation started.':'Ngolah gambar dimimitian.','Copied.':'Disalin.','Could not copy.':'Teu bisa nyalin.','Only HTTP, HTTPS, and data images are supported.':'Ngan gambar HTTP, HTTPS, jeung data nu didukung.','No readable text was found in this image. Try a larger, clearer image.':'Teu manggihan tulisan nu kabaca dina gambar. Coba gambar nu leuwih gedé tur écés.','Image processing failed.':'Ngolah gambar gagal.','This Chrome version does not support local OCR.':'Vérsi Chrome ieu teu ngarojong OCR lokal.','Local OCR is unavailable. Reload Kécap and try again.':'OCR lokal teu sadia. Muat ulang Kécap tuluy cobaan deui.',
      'Image not found.':'Gambar teu kapanggih.','This image is already processing.':'Gambar ieu keur diolah.','Rewriting image…':'Ngarobah tulisan dina gambar…','Image could not be translated.':'Tulisan dina gambar teu bisa dialihaksarakeun.','Could not display translated image.':'Hasil gambar teu bisa dipintonkeun.','Aksara Sunda font not loaded: see README':'Fon Aksara Sunda teu dimuat: tingali README','Original ↔ Aksara Sunda':'Asli ↔ Aksara Sunda'
    }
  };

  Object.assign(messages.id, {
    'medial y · Pamingkal':'y tengah · Pamingkal','medial r · Panyakra':'r tengah · Panyakra','medial l · Panyiku':'l tengah · Panyiku',
    'vowel i · Panghulu':'vokal i · Panghulu','vowel u · Panyuku':'vokal u · Panyuku','vowel é · Panéléng':'vokal é · Panéléng','vowel o · Panolong':'vokal o · Panolong','vowel e · Pamepet':'vokal e · Pamepet','vowel eu · Paneuleung':'vokal eu · Paneuleung',
    'remove vowel · Pamaéh':'hapus vokal · Pamaéh','final ng · Panyecek':'ng akhir · Panyecek','final r · Panglayar':'r akhir · Panglayar','final h · Pangwisad':'h akhir · Pangwisad',
    'Could not fetch image (HTTP 404).':'Tidak dapat mengambil gambar (HTTP 404).'
  });
  Object.assign(messages.su, {
    'medial y · Pamingkal':'y tengah · Pamingkal','medial r · Panyakra':'r tengah · Panyakra','medial l · Panyiku':'l tengah · Panyiku',
    'vowel i · Panghulu':'vokal i · Panghulu','vowel u · Panyuku':'vokal u · Panyuku','vowel é · Panéléng':'vokal é · Panéléng','vowel o · Panolong':'vokal o · Panolong','vowel e · Pamepet':'vokal e · Pamepet','vowel eu · Paneuleung':'vokal eu · Paneuleung',
    'remove vowel · Pamaéh':'mupus vokal · Pamaéh','final ng · Panyecek':'ng tungtung · Panyecek','final r · Panglayar':'r tungtung · Panglayar','final h · Pangwisad':'h tungtung · Pangwisad'
  });

  let language = 'en';
  const originalText = new WeakMap(), originalAttributes = new WeakMap();
  function translate(value, substitutions) {
    const source = String(value);
    let result = language === 'en' ? source : (messages[language]?.[source] || source);
    if (substitutions) for (const [key, replacement] of Object.entries(substitutions)) result = result.replaceAll(`{${key}}`, String(replacement));
    return result;
  }
  function setLanguage(value) { language = value === 'id' || value === 'su' ? value : 'en'; }
  function load() {
    return new Promise(resolve => {
      try { chrome.storage.local.get('uiLanguage', data => { setLanguage(data?.uiLanguage); resolve(language); }); }
      catch (_) { resolve(language); }
    });
  }
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.uiLanguage) setLanguage(changes.uiLanguage.newValue);
    });
  } catch (_) {}
  function applyTo(rootNode) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement?.closest('[data-l10n-skip]')) continue;
      const source = originalText.get(node) ?? node.nodeValue;
      originalText.set(node, source);
      const trimmed = source.trim();
      node.nodeValue = source.replace(trimmed, translate(trimmed));
    }
    if (rootNode.querySelectorAll) {
      for (const element of rootNode.querySelectorAll('[title],[aria-label],[placeholder]')) {
        if (element.closest('[data-l10n-skip]')) continue;
        for (const attribute of ['title','aria-label','placeholder']) {
          if (!element.hasAttribute(attribute)) continue;
          let originals = originalAttributes.get(element);
          if (!originals) { originals = {}; originalAttributes.set(element, originals); }
          if (originals[attribute] === undefined) originals[attribute] = element.getAttribute(attribute);
          element.setAttribute(attribute, translate(originals[attribute]));
        }
      }
    }
  }
  root.KecapLocale = { translate, setLanguage, load, applyTo, get language() { return language; } };
})(globalThis);
