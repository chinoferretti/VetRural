package vetrural.mvc.dto.request;

import lombok.Data;

@Data
public class RegistrarPesajeRequest {
    private String bovinoId;
    private Long registradoPorId;
    private double peso;
}
