package com.tezprojesi.api.service;

import com.tezprojesi.api.dto.WeakPointAnalysisResponse;
import com.tezprojesi.api.dto.WeakPointAnalysisResponse.WeakTopic;
import com.tezprojesi.api.repository.UserAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SimplifiedWeakPointAnalysisService {

    private final UserAnswerRepository userAnswerRepository;
    private final StatisticsService statisticsService;

    /**
     * Basitleştirilmiş zayıf nokta analizi
     * - Başarı oranı düşük konuları bul
     * - Basit tavsiyeleri göster
     * - Önerilen kaynakları ver
     */
    public WeakPointAnalysisResponse analyzeWeakPoints(UUID userId) {
        var topicStats = statisticsService.getTopicStats(userId);

        List<WeakTopic> weakTopics = topicStats.stream()
                .filter(stat -> {
                    double accuracy = stat.getCorrectCount() + stat.getWrongCount() > 0
                            ? (double) stat.getCorrectCount() / (stat.getCorrectCount() + stat.getWrongCount()) * 100
                            : 0;
                    return accuracy < 60;
                })
                .map(stat -> {
                    double accuracy = stat.getCorrectCount() + stat.getWrongCount() > 0
                            ? (double) stat.getCorrectCount() / (stat.getCorrectCount() + stat.getWrongCount()) * 100
                            : 0;

                    String hypothesis = getHypothesis(accuracy);
                    List<String> actionPlan = getActionPlan(stat.getTopicName(), accuracy);
                    String recommendation = getRecommendation(stat.getTopicName());

                    return WeakTopic.builder()
                            .topicName(stat.getTopicName())
                            .topicId(stat.getTopicId())
                            .successRate((int) accuracy)
                            .attemptCount(stat.getCorrectCount() + stat.getWrongCount())
                            .hypothesis(hypothesis)
                            .actionPlan(actionPlan)
                            .recommendation(recommendation)
                            .build();
                })
                .sorted(Comparator.comparingInt(WeakTopic::getSuccessRate))
                .limit(3)
                .collect(Collectors.toList());

        // Olumlu gözlem
        Optional<String> positiveReinforcement = topicStats.stream()
                .filter(stat -> {
                    double accuracy = stat.getCorrectCount() + stat.getWrongCount() > 0
                            ? (double) stat.getCorrectCount() / (stat.getCorrectCount() + stat.getWrongCount()) * 100
                            : 0;
                    return accuracy > 80;
                })
                .map(stat -> {
                    double accuracy = stat.getCorrectCount() + stat.getWrongCount() > 0
                            ? (double) stat.getCorrectCount() / (stat.getCorrectCount() + stat.getWrongCount()) * 100
                            : 0;
                    return String.format("%s konusunda %d%% başarı yakaladın. Harika ilerleme! 🎉",
                            stat.getTopicName(), (int) accuracy);
                })
                .findFirst();

        String summary = String.format("Son 30 gün içinde %d konuda zayıf bir performans gösterildi. " +
                "Aşağıdaki konulara önem vermeniz önerilir.",
                weakTopics.size());

        return WeakPointAnalysisResponse.builder()
                .summary(summary)
                .weakTopics(weakTopics)
                .positiveReinforcement(positiveReinforcement.orElse("Çalışmaya devam et! Her gün bir adım daha yaklaşıyorsun. 💪"))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private String getHypothesis(double accuracy) {
        if (accuracy < 30) {
            return "Ön koşul bilgileri eksik olabilir. Temel kavramları gözden geçirmen önerilir.";
        } else if (accuracy < 45) {
            return "Kavram yanılgısı yaşıyor olabilirsin. Konu özetini tekrar oku.";
        } else if (accuracy < 60) {
            return "Daha fazla pratik yapman gerekiyor. Benzer sorular çözerek pekiştir.";
        }
        return "Biraz daha çalışman gerekiyor.";
    }

    private List<String> getActionPlan(String topicName, double accuracy) {
        List<String> actions = new ArrayList<>();

        if (accuracy < 45) {
            actions.add(String.format("%s - Konu Özeti: MEB özetini 30 dakika çalış", topicName));
            actions.add(String.format("%s - AI Asistanı: Anlamadığın kısımları soruştur", topicName));
            actions.add(String.format("%s - Pratik: En az 5 soru çöz, tüm şıkları incele", topicName));
        } else if (accuracy < 60) {
            actions.add(String.format("%s - Yapılan hataları gözden geçir", topicName));
            actions.add(String.format("%s - Benzer zorlukta 10 soru çöz", topicName));
            actions.add(String.format("%s - Yanlış soruları çalışma listesine ekle", topicName));
        } else {
            actions.add(String.format("%s - Tekrar denemesi yap", topicName));
            actions.add(String.format("%s - Zor sorulara odaklan", topicName));
        }

        return actions;
    }

    private String getRecommendation(String topicName) {
        return String.format("Bu konuyu güçlendirmek için günde 45 dakika çalışmanız tavsiye edilir. " +
                "AI asistanından yardım alabilir, benzer soruları tekrar çözebilirsiniz.");
    }
}
