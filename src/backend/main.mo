import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type Surah = {
    number : Nat;
    arabicName : Text;
    urduName : Text;
    transliteration : Text;
    ayahCount : Nat;
    audioUrl : Text;
  };

  type Ayah = {
    number : Nat;
    arabicText : Text;
    urduTranslation : Text;
    startingTime : Nat; // seconds in audio
  };

  module Surah {
    public func compare(s1 : Surah, s2 : Surah) : Order.Order {
      Nat.compare(s1.number, s2.number);
    };
  };

  let surahs = Map.empty<Nat, Surah>();

  let ayahs = Map.empty<Nat, [Ayah]>();

  system func preupgrade() {
    Runtime.trap("ERROR: Noor-ul-Quran can only be deployed locally. It relies on external data for production.");
  };

  system func postupgrade() {
    surahs.add(
      1,
      {
        number = 1;
        arabicName = "الفاتحة";
        urduName = "الفاتحہ";
        transliteration = "Al-Fatihah";
        ayahCount = 7;
        audioUrl = "https://cdn.noorquran.com/al-fatiha.mp3";
      },
    );

    // Surah Al-Fatihah Ayahs
    let fatihahAyahs : [Ayah] = [
      {
        number = 1;
        arabicText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
        urduTranslation = "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے";
        startingTime = 0;
      },
      {
        number = 2;
        arabicText = "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ";
        urduTranslation = "سب تعریف اللہ کے لیے ہے جو تمام جہانوں کا پالنے والا ہے";
        startingTime = 5;
      },
      {
        number = 3;
        arabicText = "الرَّحْمَٰنِ الرَّحِيمِ";
        urduTranslation = "جو بڑا مہربان نہایت رحم والا ہے";
        startingTime = 9;
      },
      {
        number = 4;
        arabicText = "مَالِكِ يَوْمِ الدِّينِ";
        urduTranslation = "روزِ جزا کا مالک ہے";
        startingTime = 11;
      },
      {
        number = 5;
        arabicText = "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ";
        urduTranslation = "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں";
        startingTime = 14;
      },
      {
        number = 6;
        arabicText = "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ";
        urduTranslation = "ہمیں سیدھا راستہ دکھا";
        startingTime = 19;
      },
      {
        number = 7;
        arabicText = "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ";
        urduTranslation = "ان لوگوں کا راستہ جن پر تو نے انعام کیا نہ کہ ان کا (راستہ) جن پر غضب کیا گیا اور نہ گمراہوں کا";
        startingTime = 22;
      },
    ];
    ayahs.add(1, fatihahAyahs);

    // Surah Al-Baqarah (sample)
    surahs.add(
      2,
      {
        number = 2;
        arabicName = "البقرة";
        urduName = "البقرہ";
        transliteration = "Al-Baqarah";
        ayahCount = 286;
        audioUrl = "https://cdn.noorquran.com/al-baqarah.mp3";
      },
    );

    let baqarahAyahs : [Ayah] = [
      {
        number = 1;
        arabicText = "الم";
        urduTranslation = "الف لام میم";
        startingTime = 0;
      },
      {
        number = 2;
        arabicText = "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ";
        urduTranslation = "یہ وہ کتاب ہے جس میں کوئی شک نہیں، ہدایت ہے پرہیزگاروں کے لیے";
        startingTime = 5;
      },
      {
        number = 3;
        arabicText = "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ";
        urduTranslation = "وہ لوگ جو غیب پر ایمان لاتے ہیں اور نماز قائم کرتے ہیں اور ہمارے دیے ہوئے رزق میں سے خرچ کرتے ہیں";
        startingTime = 15;
      },
      {
        number = 4;
        arabicText = "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ";
        urduTranslation = "اور جو لوگ ایمان لاتے ہیں اس چیز پر جو آپ پر نازل کی گئی اور جو آپ سے پہلے نازل کی گئی اور آخرت پر بھی وہ یقین رکھتے ہیں";
        startingTime = 24;
      },
      {
        number = 5;
        arabicText = "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ";
        urduTranslation = "یہ لوگ اپنے رب کی طرف سے ہدایت پر ہیں اور یہی فلاح پانے والے ہیں";
        startingTime = 34;
      },
      {
        number = 6;
        arabicText = "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ";
        urduTranslation = "یقیناً جو کافر ہیں، ان کے لئے برابر ہے کہ آپ انہیں ڈرائیں یا نہ ڈرائیں، وہ ایمان نہیں لائیں گے";
        startingTime = 40;
      },
      {
        number = 7;
        arabicText = "خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ وَلَهُمْ عَذَابٌ عَظِيمٌ";
        urduTranslation = "اللہ نے ان کے دلوں اور کانوں پر مہر لگا دی ہے اور ان کی آنکھوں پر پردہ ہے اور ان کے لیے بڑا عذاب ہے";
        startingTime = 50;
      },
      {
        number = 8;
        arabicText = "وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ";
        urduTranslation = "اور بعض لوگ ایسے ہیں جو کہتے ہیں کہ ہم اللہ اور یوم آخرت پر ایمان لائے حالانکہ وہ ایمان دار نہیں ہیں";
        startingTime = 60;
      },
      {
        number = 9;
        arabicText = "يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ";
        urduTranslation = "وہ اللہ اور ایمان داروں کو دھوکہ دینے کی کوشش کرتے ہیں، حالانکہ وہ اپنے سوا کسی کو دھوکہ نہیں دیتے اور انہیں اس کا شعور نہیں";
        startingTime = 68;
      },
      {
        number = 10;
        arabicText = "فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ";
        urduTranslation = "ان کے دلوں میں بیماری ہے سو اللہ نے ان کی بیماری کو بڑھا دیا اور ان کے لیے درد ناک عذاب ہے اس لیے کہ وہ جھوٹ بولتے تھے";
        startingTime = 75;
      },
    ];
    ayahs.add(2, baqarahAyahs);
  };

  public query ({ caller }) func getAllSurahs() : async [Surah] {
    surahs.values().toArray().sort();
  };

  public query ({ caller }) func getAyahsForSurah(surahNumber : Nat) : async [Ayah] {
    switch (ayahs.get(surahNumber)) {
      case (null) { Runtime.trap("Surah not found or no ayahs available") };
      case (?ayahArray) { ayahArray };
    };
  };
};
