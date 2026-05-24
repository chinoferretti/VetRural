package vetrural.mvc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vetrural.mvc.enumerations.VacunaTipoEnum;

@Data
public class RegistrarVacunacionRequest {
    @NotNull
    private Long bovinoId;

    @NotNull
    private Long registradoPorId;

    @NotNull
    private VacunaTipoEnum vacuna;
}
