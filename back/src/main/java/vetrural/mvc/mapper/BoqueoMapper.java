package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.BoqueoResponse;
import vetrural.mvc.entity.Boqueo;

public final class BoqueoMapper {

    private BoqueoMapper() {}

    public static BoqueoResponse toResponse(Boqueo b) {
        return new BoqueoResponse(
                b.getId(),
                b.getFechaHora(),
                b.getBovino().getId(),
                b.getRegistradoPor().getIdUsuario(),
                b.getDientes(),
                b.getDeterioro(),
                b.getDentadura()
        );
    }
}
