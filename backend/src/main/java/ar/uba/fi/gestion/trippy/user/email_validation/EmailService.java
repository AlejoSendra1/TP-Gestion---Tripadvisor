package ar.uba.fi.gestion.trippy.user.email_validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;


@Service
public class EmailService {

    private JavaMailSender mailSender;

    @Value("http://localhost:30003")
    private String frontendBaseUrl;
    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public  void sendEmail(String to, String subject, String validationLink){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("bievenida@futbolapp.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(validationLink);
        mailSender.send(message);
    }

    @Async
    public void sendValidationEmail(String to, String validationToken){
        String subject = "Validation Email";
        String validationLink = "Te damos la bienvenida a FutbolApp\n" +
                frontendBaseUrl + "/verify-email?" + to + "&token=" + validationToken
                +  "\n\n¡Gracias por unirte a FutbolApp!";;
        System.out.println("Enviando mail a: " + to + " con token de acceso: " + validationToken);
        sendEmail(to, subject, validationLink);
    }


}
