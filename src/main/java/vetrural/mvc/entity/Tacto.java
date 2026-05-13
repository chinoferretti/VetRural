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

public class Tacto extends EventoSanitario {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacionEnum situacion;

    @Enumerated(EnumType.STRING)
    private PeriodoEnum periodo;
}
