package vetrural.mvc.dto;

import lombok.Data;

@Data
public class CrearSesionRequest {
    private String establecimiento;
    private Long idAnotador;
    private Long idVeterinario;
}
