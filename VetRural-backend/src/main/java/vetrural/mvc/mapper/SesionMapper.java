package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.SesionResponse;
import vetrural.mvc.entity.Sesion;

public final class SesionMapper {

    private SesionMapper() {}

    public static SesionResponse toResponse(Sesion s) {
        return new SesionResponse(
                s.getId(),
                s.getFechaHora(),
                s.getVeterinario().getIdUsuario(),
                s.getVeterinario().getNombre() + " " + s.getVeterinario().getApellido(),
                s.getAnotador(),
                s.getEstablecimiento().getId(),
                s.getEstablecimiento().getNombre()
        );
    }
}
