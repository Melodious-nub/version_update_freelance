import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-three-scene',
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.scss'],
})
export class ThreeSceneComponent implements OnInit {
  @Input() containerData: any; // Input to dynamically pass JSON data
  previousRenderer: any = null;
  excludedProducts = [];
  imgUrl= environment.imgUrl
  constructor(private elementRef: ElementRef, private toastr: ToastrService) {}

  ngOnInit(): void {}

  ngOnChanges() {}

  ngAfterViewInit(): void {}

  create3DScene(productOrder) {
    this.excludedProducts = [];
    let data = this.containerData;

    const containerElement = this.elementRef.nativeElement;

    if (this.previousRenderer) {
      containerElement.removeChild(this.previousRenderer.domElement);
      this.previousRenderer.dispose();
      this.previousRenderer = null;
    }

    const width = containerElement.offsetWidth;
    const height = 500;

    const SCALE_FACTOR = 15; // Adjust this to scale down the scene

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 50, 300); // Adjusted for smaller scene

    // Create Renderer
    const renderer = new THREE.WebGLRenderer();
    this.previousRenderer = renderer;
    renderer.setSize(width, height);
    containerElement.appendChild(renderer.domElement);

    // Add OrbitControls for rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Function to calculate total volume of products
    const calculateTotalVolume = (products) => {
      return products.reduce((total, product) => {
        const productVolume =
          product.dimensions.length *
          product.dimensions.width *
          product.dimensions.height;  
        return total + productVolume * product.quantity;
      }, 0);
    };
  // Check if total product volume exceeds container capacity
    const containerVolume =
      data.dimensions.length * data.dimensions.width * data.dimensions.height;
    const totalProductVolume = calculateTotalVolume(data.products);



    if (totalProductVolume > containerVolume) {
      this.toastr.error('Total volume of products exceeds container capacity!');
      return;
    }

    // Packing logic: stack boxes from the back to the gate
    // NOTE: We now pass in the productOrder array and sort the products accordingly.
    const packBoxes = (containerDimensions, products, productOrder) => {
      const packedBoxes = [];
      const excludedProducts = [];

      // Sort products based on the provided productOrder array.
      // Products whose IDs appear earlier in productOrder will be packed first.
      const sortedProducts = products.slice().sort((a, b) => {
        const indexA = productOrder.indexOf(a.id);
        const indexB = productOrder.indexOf(b.id);
        return indexA - indexB;
      });

      let space = {
        x: -containerDimensions.length / 2, // Start at the back
        y: -containerDimensions.height / 2, // Ground level
        z: -containerDimensions.width / 2, // Start on one side
      };

      sortedProducts.forEach((product) => {
        for (let i = 0; i < product.quantity; i++) {
          const box = {
            length: product.dimensions.length / SCALE_FACTOR,
            width: product.dimensions.width / SCALE_FACTOR,
            height: product.dimensions.height / SCALE_FACTOR,
            color: product.color,
            label: product.id,
          };

          if (space.y + box.height > containerDimensions.height / 2) {
            space.y = -containerDimensions.height / 2; // Reset height
            space.z += box.width + 0.5; // Move outward toward the gate
          }

          if (space.z + box.width > containerDimensions.width / 2) {
            space.z = -containerDimensions.width / 2; // Reset to one side
            space.x += box.length + 0.5; // Move closer to the gate
          }

          if (space.x + box.length > containerDimensions.length / 2) {
            // Skip this product if it doesn't fit
            const index = excludedProducts.findIndex(
              (item) => item.id == product.id
            );
            if (index == -1) {
              excludedProducts.push(product);
              console.warn(
                `Product ${product.id} does not fit in the container.`
              );
            }

            continue;
          }

          packedBoxes.push({
            x: space.x + box.length / 2,
            y: space.y + box.height / 2,
            z: space.z + box.width / 2,
            ...box,
          });

          space.y += box.height + 0.5; // Stack vertically
        }
      });

      if (excludedProducts.length > 0) {
        this.toastr.warning(
          'Some products could not be packed due to space constraints.'
        );
      }

      return { packedBoxes, excludedProducts };
    };

    // Scale Container Dimensions
    const scaledContainerDimensions = {
      length: data.dimensions.length / SCALE_FACTOR,
      width: data.dimensions.width / SCALE_FACTOR,
      height: data.dimensions.height / SCALE_FACTOR,
    };

    // Add Container Outline
    const containerGeometry = new THREE.BoxGeometry(
      scaledContainerDimensions.length,
      scaledContainerDimensions.height,
      scaledContainerDimensions.width
    );
    const containerMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      wireframe: true,
    });
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    scene.add(container);

    // Add Bottom Face with Brown Color
    const bottomGeometry = new THREE.PlaneGeometry(
      scaledContainerDimensions.length,
      scaledContainerDimensions.width
    );
    const bottomMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b4513,
      side: THREE.DoubleSide,
    });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.rotation.x = Math.PI / 2; // Align horizontally
    bottom.position.y = -scaledContainerDimensions.height / 2; // Position at the bottom
    scene.add(bottom);

    // Mark the Gate of the Container
    const gateGeometry = new THREE.PlaneGeometry(
      scaledContainerDimensions.width,
      scaledContainerDimensions.height
    );
    const gateMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(scaledContainerDimensions.length / 2, 0, 0); // Gate at one end
    gate.rotation.y = Math.PI / 2; // Rotate to align with container opening
    scene.add(gate);

    // Efficiently Pack Products with Color Coding
    const { packedBoxes, excludedProducts } = packBoxes(
      scaledContainerDimensions,
      data.products,
      productOrder
    );

    this.excludedProducts = excludedProducts;

    // Add packed boxes to the scene
    packedBoxes.forEach((box) => {
      const boxGeometry = new THREE.BoxGeometry(
        box.length,
        box.height,
        box.width
      );
      const boxMaterial = new THREE.MeshBasicMaterial({ color: box.color });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

      const boxBorder = new THREE.EdgesGeometry(boxGeometry);
      const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const border = new THREE.LineSegments(boxBorder, borderMaterial);
      boxMesh.add(border);

      boxMesh.position.set(box.x, box.y, box.z);
      scene.add(boxMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);
    const addLabel = (text, position, rotation) => {
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 20,
          height: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(position.x, position.y, position.z);
        textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
        scene.add(textMesh);
      });
    };

    addLabel("TOP VIEW", { x: 0, y: scaledContainerDimensions.height / 2 + 1, z: 0 }, { x: Math.PI / 2, y: 0, z: 0 });
    addLabel("GATE", { x: scaledContainerDimensions.length / 2 + 1, y: 0, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 });

    // Render Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }

  viewStackingVideo() {}

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.containerData.products,
      event.previousIndex,
      event.currentIndex
    );
    const idArray = this.containerData.products.map((item) => item.id);
    this.create3DScene(idArray);
    // You can also emit or use idArray as needed
  }
}
