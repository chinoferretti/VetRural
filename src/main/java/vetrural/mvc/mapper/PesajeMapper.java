package vetrural.mvc.mapper;

import vetrural.mvc.dto.response.PesajeResponse;
import vetrural.mvc.entity.Pesaje;

public final class PesajeMapper {

    private PesajeMapper() {}

    public static PesajeResponse toResponse(Pesaje p) {
        return new PesajeResponse(
                p.getId(),
                p.getFechaHora(),
                p.getBovino().getIdAnimal(),
                p.getRegistradoPor().getIdUsuario(),
                p.getPeso()
        );
    }
}
