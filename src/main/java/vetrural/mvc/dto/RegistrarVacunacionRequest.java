package vetrural.mvc.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistrarVacunacionRequest {
    private String idBovino;
    private LocalDate aftosa;
    private LocalDate brucelosis;
    private LocalDate carbunco;
    private LocalDate clostridial;
    private LocalDate ibrBvd;
}
