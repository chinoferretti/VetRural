package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.VacunacionResponse;
import vetrural.mvc.entity.Vacunacion;

public final class VacunacionMapper {

    private VacunacionMapper() {}

    public static VacunacionResponse toResponse(Vacunacion v) {
        return new VacunacionResponse(
                v.getId(),
                v.getFechaHora(),
                v.getBovino().getId(),
                v.getSesion().getId(),
                v.getVacuna()
        );
    }
}
