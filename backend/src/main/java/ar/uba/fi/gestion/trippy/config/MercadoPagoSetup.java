package ar.uba.fi.gestion.trippy.config;

import com.mercadopago.MercadoPagoConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class MercadoPagoSetup {

    // 1. Inyecta el valor desde application.properties
    @Value("${mercadopago.access-token:}")
    private String mercadoPagoAccessToken;

    // 2. Este método se ejecuta automáticamente DESPUÉS
    //    de que Spring termine de cargar esta clase.
    @PostConstruct
    public void initMercadoPago() {
        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
        System.out.println("Mercado Pago SDK inicializado con éxito.");
    }
}