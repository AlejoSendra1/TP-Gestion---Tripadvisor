package ar.uba.fi.gestion.trippy.review;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class IAReviewService {

    private final ReviewRepository reviewRepository;

    private static final String GEMINI_ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private static final String GEMINI_API_KEY = "AIzaSyDQshZdvbiOK9-QZhOcM8nJ28ojrf1ojf4";

    public IAReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public String summarizeReviews(Long publicationId) {
        var reviews = reviewRepository.findByPublicationId(publicationId, null).getContent();
        if (reviews.isEmpty()) return "No hay reseñas suficientes para generar un resumen.";

        StringBuilder reviewText = new StringBuilder();
        for (var r : reviews) {
            reviewText.append("⭐ ")
                      .append(r.getPublicationRating())
                      .append("/5: ")
                      .append(r.getReviewContent())
                      .append("\n");
        }

        String prompt = """
            Analiza las siguientes reseñas y genera un resumen estructurado:
            - Puntos positivos
            - Puntos negativos
            - Promedio de calificación aproximado
            - Conclusión breve en tono neutral

            Reseñas:
            %s
            """.formatted(reviewText);

        try {
            var client = HttpClient.newHttpClient();
            var body = """
                {
                  "contents": [{
                    "parts": [{"text": "%s"}]
                  }]
                }
                """.formatted(prompt.replace("\"", "\\\""));

            var request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_ENDPOINT + "?key=" + GEMINI_API_KEY))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            var response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Error al llamar a Gemini: código " + response.statusCode() +
                        "\nRespuesta: " + response.body();
            }

            var json = new JSONObject(response.body());
            JSONArray candidates = json.optJSONArray("candidates");
            if (candidates == null || candidates.isEmpty())
                return "No se pudo generar un resumen válido: " + response.body();

            String text = candidates.getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

            return text.trim();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error al generar el resumen: " + e.getMessage();
        }
    }
}