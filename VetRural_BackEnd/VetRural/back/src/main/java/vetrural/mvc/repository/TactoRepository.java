package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Tacto;
import java.util.List;
import java.util.Optional;

@Repository
public interface TactoRepository extends JpaRepository<Tacto, Long> {
    List<Tacto> findByBovino(Bovino bovino);
    Optional<Tacto> findTopByBovinoOrderByFechaHoraDesc(Bovino bovino);

    @Query("SELECT t FROM Tacto t WHERE t.bovino.establecimiento.id = :estId")
    List<Tacto> findUltimosPorEstablecimiento(@Param("estId") Long estId);
}
