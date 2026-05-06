package vetrural.mvc.dto;

import lombok.Data;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;

@Data
public class RegistrarBoqueoRequest {
    private String idBovino;
    private DientesEnum dientes;
    private DeterioroEnum deterioro;
    private DentaduraEnum dentadura;
}
