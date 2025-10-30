import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Kullanıcı istatistiklerini PDF olarak indir
 */
export const generateStatsPDF = (data) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Helper function to call autoTable with correct context
  const addTable = (options) => {
    autoTable(doc, options);
  };
  const pageWidth = doc.internal.pageSize.getWidth();

  // Set default font (use times or courier for better Turkish character support)
  doc.setFont('times', 'normal');

  // Başlık
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.text('AceIt - Sinav Hazirlik Raporu', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Rapor Tarihi: ${today}`, pageWidth / 2, 28, { align: 'center' });

  let yPos = 40;

  // === 1. KULLANICI BİLGİSİ ===
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Ogrenci Bilgileri', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('times', 'normal');

  // User name - get from user object properly
  const userName = data.user?.name || data.user?.username || 'Kullanici';
  doc.text(`Ad Soyad: ${userName}`, 14, yPos);
  yPos += 6;
  doc.text(`E-posta: ${data.user?.email || 'Bilinmiyor'}`, 14, yPos);
  yPos += 6;
  doc.text(`Sinav Turu: ${data.user?.examType || 'Bilinmiyor'}`, 14, yPos);
  yPos += 12;
  
  // === 2. GENEL İSTATİSTİKLER ===
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Genel Istatistikler', 14, yPos);
  yPos += 8;

  // Calculate correct and wrong answers from success rate and total questions
  const totalQuestions = data.overview?.summary?.totalQuestions || 0;
  const successRate = data.overview?.summary?.successRate || 0;
  const correctAnswers = Math.round((totalQuestions * successRate) / 100);
  const wrongAnswers = totalQuestions - correctAnswers;

  const generalStats = [
    ['Toplam Calisma Suresi', `${Math.floor((data.overview?.summary?.totalDuration || 0) / 60)} saat ${(data.overview?.summary?.totalDuration || 0) % 60} dakika`],
    ['Toplam Soru Sayisi', `${totalQuestions}`],
    ['Dogru Cevap', `${correctAnswers}`],
    ['Yanlis Cevap', `${wrongAnswers}`],
    ['Basari Orani', `%${successRate}`],
    ['Aktif Gun Sayisi (Streak)', `${data.overview?.streak?.current || 0} gun`],
    ['En Uzun Streak', `${data.overview?.streak?.longest || 0} gun`],
    ['Toplam Pomodoro', `${data.pomodoro?.total?.count || 0}`],
  ];
  
  addTable({
    startY: yPos,
    head: [['Metrik', 'Deger']],
    body: generalStats,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold', font: 'times' },
    styles: { fontSize: 9, font: 'times' },
    margin: { left: 14, right: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 12;

  // === 3. DERS BAZLI PERFORMANS ===
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Ders Bazli Performans', 14, yPos);
  yPos += 8;

  const subjectRows = (data.subjects?.subjects || []).map(item => [
    item.subject.name,
    `${item.stats.totalDurationHours} saat`,
    `${item.stats.totalQuestions}`,
    `%${item.stats.successRate}`,
    `%${item.topics.completionRate}`,
    item.status === 'good' ? 'Iyi' : item.status === 'medium' ? 'Orta' : 'Yetersiz',
  ]);

  addTable({
    startY: yPos,
    head: [['Ders', 'Sure', 'Soru', 'Basari', 'Tamamlanma', 'Durum']],
    body: subjectRows,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], fontSize: 9, fontStyle: 'bold', font: 'times' },
    styles: { fontSize: 8, font: 'times' },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY + 12;
  
  // === 4. KONU DURUMU ÖZETİ ===
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Konu Durumu Ozeti', 14, yPos);
  yPos += 8;

  const topicSummary = [
    ['Toplam Konu', `${data.topics?.summary?.totalTopics || 0}`],
    ['Calisilan Konu', `${data.topics?.summary?.studiedTopics || 0}`],
    ['Guclu Konular', `${data.topics?.summary?.strongTopics || 0}`],
    ['Zayif Konular', `${data.topics?.summary?.weakTopics || 0}`],
    ['Hic Calisilmayan', `${data.topics?.summary?.unstudiedTopics || 0}`],
    ['Tekrar Gereken', `${data.topics?.summary?.dueForReviewCount || 0}`],
    ['Gecikmis Tekrar', `${data.topics?.summary?.overdueCount || 0}`],
  ];

  addTable({
    startY: yPos,
    head: [['Kategori', 'Sayi']],
    body: topicSummary,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold', font: 'times' },
    styles: { fontSize: 9, font: 'times' },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY + 12;
  
  // === 5. ZAYIF KONULAR LİSTESİ (en fazla 10) ===
  if (data.topics?.categorized?.weak && data.topics.categorized.weak.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Dikkat Edilmesi Gereken Konular (Zayif)', 14, yPos);
    yPos += 8;

    const weakTopics = data.topics.categorized.weak.slice(0, 10).map(item => [
      item.topic.name,
      item.subject.name,
      `%${item.stats.successRate}`,
      `${item.stats.totalQuestions} soru`,
    ]);

    addTable({
      startY: yPos,
      head: [['Konu', 'Ders', 'Basari', 'Soru Sayisi']],
      body: weakTopics,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], fontSize: 9, fontStyle: 'bold', font: 'times' },
      styles: { fontSize: 8, font: 'times' },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 12;
  }

  // === 6. GECİKMİŞ TEKRARLAR ===
  if (data.topics?.overdue && data.topics.overdue.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Gecikmis Tekrarlar (Acil!)', 14, yPos);
    yPos += 8;

    const overdueTopics = data.topics.overdue.slice(0, 10).map(item => [
      item.topic.name,
      item.subject.name,
      `${item.spacedRepetition.daysOverdue} gun gecikmis`,
    ]);

    addTable({
      startY: yPos,
      head: [['Konu', 'Ders', 'Durum']],
      body: overdueTopics,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], fontSize: 9, fontStyle: 'bold', font: 'times' },
      styles: { fontSize: 8, font: 'times' },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 12;
  }
  
  // === 7. POMODORO ÖZETİ ===
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Pomodoro Teknigi Kullanimi', 14, yPos);
  yPos += 8;

  const pomodoroStats = [
    ['Toplam Pomodoro', `${data.pomodoro?.total?.count || 0}`],
    ['Toplam Sure', `${data.pomodoro?.total?.durationHours || 0} saat`],
    ['Gunluk Ortalama', `${data.pomodoro?.averageDaily || 0} pomodoro`],
  ];

  addTable({
    startY: yPos,
    head: [['Metrik', 'Deger']],
    body: pomodoroStats,
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], fontSize: 10, fontStyle: 'bold', font: 'times' },
    styles: { fontSize: 9, font: 'times' },
    margin: { left: 14, right: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 12;

  // === 8. ÖNERİLER ===
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Oneriler', 14, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('times', 'normal');

  const recommendations = [];

  if (data.topics?.summary?.weakTopics > 5) {
    recommendations.push(`• ${data.topics.summary.weakTopics} zayif konu tespit edildi. Bu konulara odaklanilmasi onerilir.`);
  }

  if (data.topics?.summary?.overdueCount > 0) {
    recommendations.push(`• ${data.topics.summary.overdueCount} konu icin tekrar gecikmis. Spaced repetition takvimine uyulmasi kritik.`);
  }

  if ((data.overview?.summary?.successRate || 0) < 70) {
    recommendations.push('• Genel basari orani %70\'in altinda. Daha fazla pratik ve konu tekrari yapilmali.');
  }

  if ((data.pomodoro?.averageDaily || 0) < 4) {
    recommendations.push('• Gunluk ortalama pomodoro sayisi dusuk. Calisma duzenini artirmak onerilir.');
  }

  if (data.topics?.summary?.unstudiedTopics > 10) {
    recommendations.push(`• ${data.topics.summary.unstudiedTopics} konu hic calisilmamis. Tum konulari kapsamak onemli.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('• Harika gidiyorsun! Mevcut performansini korumaya devam et.');
  }

  recommendations.forEach((rec) => {
    doc.text(rec, 14, yPos, { maxWidth: pageWidth - 28 });
    yPos += 8;
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(128);
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'AceIt - Sinav Hazirlik ve Takip Uygulamasi',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }
  
  // PDF'i indir
  const fileName = `AceIt_Rapor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};