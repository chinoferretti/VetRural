package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Invitacion;
import vetrural.mvc.entity.Usuario;
import java.util.List;

@Repository
public interface InvitacionRepository extends JpaRepository<Invitacion, Long> {

    @Query("SELECT i FROM Invitacion i WHERE i.usuarioInvitado.idUsuario = :usuarioId")
    List<Invitacion> findByUsuarioInvitadoId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT i FROM Invitacion i WHERE i.establecimiento.id = :estId")
    List<Invitacion> findByEstablecimientoId(@Param("estId") Long estId);

    @Query("SELECT COUNT(i) > 0 FROM Invitacion i WHERE i.establecimiento.id = :estId AND i.usuarioInvitado.idUsuario = :usuarioId")
    boolean existsByEstablecimientoAndInvitado(@Param("estId") Long estId, @Param("usuarioId") Long usuarioId);
}
