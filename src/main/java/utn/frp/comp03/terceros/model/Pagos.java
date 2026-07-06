package utn.frp.comp03.terceros.model;

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="pagos")

public class Pagos {
	
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "id_pagos")
	    private Long id;
	    
	    // Relación con Tercero
	    @ManyToOne
	    @JoinColumn(name = "id_tercero", nullable = false)
	    private Terceros tercero;

	    @Column(name = "fecha_pago")
	    private LocalDate fechaPago;

	    @Column(name = "monto_pago")
	    private Double montoPago;
	    
	    @Column(name = "modo_pago")
	    private String modoPago;

	    // Relación con Pagos_Detalle
	    @OneToOne(mappedBy = "pago", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	    private Pagos_Detalle detalle;

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public Terceros getTercero() {
			return tercero;
		}

		public void setTercero(Terceros tercero) {
			this.tercero = tercero;
		}

		public LocalDate getFechaPago() {
			return fechaPago;
		}

		public void setFechaPago(LocalDate fechaPago) {
			this.fechaPago = fechaPago;
		}

		public Double getMontoPago() {
			return montoPago;
		}

		public void setMontoPago(Double montoPago) {
			this.montoPago = montoPago;
		}

		public String getModoPago() {
			return modoPago;
		}

		public void setModoPago(String modoPago) {
			this.modoPago = modoPago;
		}

		public Pagos_Detalle getDetalle() {
			return detalle;
		}

		public void setDetalle(Pagos_Detalle detalle) {
			this.detalle = detalle;
		}
	   
	}

