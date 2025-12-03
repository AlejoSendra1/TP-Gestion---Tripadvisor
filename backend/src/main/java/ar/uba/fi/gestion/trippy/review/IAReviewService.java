package ar.uba.fi.gestion.trippy.review;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import ar.uba.fi.gestion.trippy.reviewQualification.ReviewQualificationService;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class IAReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewQualificationService reviewQualificationService;

    private static final String GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private static final String GEMINI_API_KEY = "AIzaSyA_LSW1Yd9y2PTBrfBoGrOFGL2iVIU9pME";

    public IAReviewService(ReviewRepository reviewRepository, ReviewQualificationService reviewQualificationService) {
        this.reviewRepository = reviewRepository;
        this.reviewQualificationService = reviewQualificationService;
    }

    public String summarizeReviews(Long publicationId) {
        var reviews = reviewRepository.findByPublicationId(publicationId, null).getContent();
        if (reviews.isEmpty())
            return "No hay reseñas suficientes para generar un resumen.";

        StringBuilder reviewText = new StringBuilder();
        for (var r : reviews) {
            Long qualification = reviewQualificationService.getReviewQualification(r.getId());
            reviewText.append("/5: ")
                    .append(r.getReviewContent())
                    .append("\n Users qualification:")
                    .append(qualification)
                    .append("\n");

        }

        String prompt = """
                Analiza las siguientes reseñas y genera un resumen estructurado con el siguiente orden:

                (Aquí debe ir un párrafo de 3-4 líneas resumiendo el sentir general de las reseñas)

                Puntos Positivos:
                (Lista de pros)

                Puntos Negativos:
                (Lista de contras)

                Asegúrate de usar el carácter de **punto sólido (•)** y de incluir **indentación** con espacios o tabulaciones antes de cada punto.

                Reseñas:
                %s
                """
                .formatted(reviewText);

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

            return text;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error al generar el resumen: " + e.getMessage();
        }
    }
}
