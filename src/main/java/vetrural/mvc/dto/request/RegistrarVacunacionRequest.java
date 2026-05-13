package vetrural.mvc.dto.request;

import lombok.Data;
import vetrural.mvc.enumerations.VacunaTipoEnum;

@Data
public class RegistrarVacunacionRequest {
    private String bovinoId;
    private Long registradoPorId;
    private VacunaTipoEnum vacuna;
}
