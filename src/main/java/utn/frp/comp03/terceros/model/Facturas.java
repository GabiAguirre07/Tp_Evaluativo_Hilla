package utn.frp.comp03.terceros.model;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="facturas")
public class Facturas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Long id;

    @Column(name = "fecha_factura")
    private LocalDate fechaFactura;

    @Column(name = "numero")
    private Double numero;

    // Relación con Tercero
    @ManyToOne
    @JoinColumn(name = "id_tercero", nullable = false)
    private Terceros tercero;

    // Relación con Facturas_Items
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL,
    		   orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference // Permite evitar problemas de referencia circular (loop infinito)
    // orphanRemoval garantiza que al quitar un item de una factura se borre de la BDD.
    private List<Facturas_Items> items;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getFechaFactura() {
		return fechaFactura;
	}

	public void setFechaFactura(LocalDate fechaFactura) {
		this.fechaFactura = fechaFactura;
	}

	public Double getNumero() {
		return numero;
	}

	public void setNumero(Double numero) {
		this.numero = numero;
	}

	public Terceros getTercero() {
		return tercero;
	}

	public void setTercero(Terceros tercero) {
		this.tercero = tercero;
	}

	public List<Facturas_Items> getItems() {
		return items;
	}

	public void setItems(List<Facturas_Items> items) {
		this.items = items;
	}

   
}