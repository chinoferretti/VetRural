package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.enumerations.PeriodoEnum;

@Entity
@Table(name = "Tacto")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Tacto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTacto;

    private String idBovino;

    @Enumerated(EnumType.STRING)
    private SituacionEnum situacion;
    @Enumerated(EnumType.STRING)
    private PeriodoEnum periodo;

}
