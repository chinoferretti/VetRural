package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Bovino;
import java.util.List;
import java.util.Optional;

@Repository
public interface BoqueoRepository extends JpaRepository<Boqueo, Long> {
    List<Boqueo> findByBovino(Bovino bovino);
    Optional<Boqueo> findTopByBovinoOrderByFechaHoraDesc(Bovino bovino);

    @Query("SELECT b FROM Boqueo b WHERE b.bovino.establecimiento.id = :estId")
    List<Boqueo> findUltimosPorEstablecimiento(@Param("estId") Long estId);
}
