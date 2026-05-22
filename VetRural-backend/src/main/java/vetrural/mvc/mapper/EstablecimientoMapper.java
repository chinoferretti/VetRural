package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.EstablecimientoResponse;
import vetrural.mvc.entity.Establecimiento;

public final class EstablecimientoMapper {

    private EstablecimientoMapper() {}

    public static EstablecimientoResponse toResponse(Establecimiento e) {
        return new EstablecimientoResponse(e.getId(), e.getNombre());
    }
}
