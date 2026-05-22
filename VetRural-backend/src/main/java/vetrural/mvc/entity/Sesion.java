package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Sesion")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @ManyToOne(optional = false)
    @JoinColumn(name = "veterinario_id", nullable = false)
    private Usuario veterinario;

    @Column
    private String anotador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "establecimiento_id", nullable = false)
    private Establecimiento establecimiento;
}
