
import * as THREE from 'three';
import metaversefile from 'metaversefile';
const { useApp, useLoaders, useFrame, useScene, useInternals, useLocalPlayer, useActivate, useUse, useWear, usePhysics, getAppByPhysicsId, useCleanup } = metaversefile;

//

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1');

export default e => {

    const app = useApp();
    const { components } = app;
    const { scene, camera } = useInternals();
    const localPlayer = useLocalPlayer();
    const physics = usePhysics();

    const floorPhysicsId = physics.addBoxGeometry(
        new THREE.Vector3(0, -1000, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(1000, 2000, 1000).multiplyScalar(0.5),
        false
    );

    const placeHolders = [];
    const doors = { speed: 0.05, left: null, right: null, colliderL: null, colliderR: null, state: 'closed', offset: 0, offsetMax: 5 };
    const doors2 = { speed: 0.05, left: null, right: null, colliderL: null, colliderR: null, state: 'closed', offset: 0, offsetMax: 5 };
    const raycaster = new THREE.Raycaster();
    const tmpVec3a = new THREE.Vector3();

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {

            const { gltfLoader } = useLoaders();
            gltfLoader.load( params.filePath + params.fileName, ( gltf ) => {

                resolve( gltf.scene );

            });

        });

    };

    function updateDoors () {

        if ( ! doors.left || ! doors.right ) return;
        let adjustedPosLeft = doors.left.position.clone().add(app.position);
        let adjustedPosRight = doors.right.position.clone().add(app.position);
        let distance = tmpVec3a.set( ( adjustedPosLeft.x + adjustedPosRight.x ) / 2, 0, ( adjustedPosLeft.z + adjustedPosRight.z ) / 2 ).sub( localPlayer.position );
        distance.y = 0;
        distance = distance.length();

        if ( distance < 2 && doors.state !== 'opened' ) {

            doors.state = 'opening';

        }

        if ( distance > 2 && doors.state !== 'closed' ) {

            doors.state = 'closing';

        }

        if ( doors.state === 'opening' ) {

            doors.offset += doors.speed;
            doors.left.position.x = doors.left.userData.origPos.x + doors.offset;
            doors.right.position.x = doors.right.userData.origPos.x - doors.offset;

            if ( doors.offset >= doors.offsetMax ) {

                doors.state = 'opened';

            }

        }

        if ( doors.state === 'closing' ) {

            doors.offset -= doors.speed;
            doors.left.position.x = doors.left.userData.origPos.x + doors.offset;
            doors.right.position.x = doors.right.userData.origPos.x - doors.offset;

            if ( doors.offset <= 0 ) {

                doors.state = 'closed';

            }

        }

        doors.left.updateWorldMatrix();
        doors.right.updateWorldMatrix();

        doors.colliderL.position.copy(doors.left.position);
        doors.colliderR.position.copy(doors.right.position);

        physics.setTransform(doors.colliderL);
        physics.setTransform(doors.colliderR);

    };

    function updateDoors2 () {

        if ( ! doors2.left || ! doors2.right ) return;
        let adjustedPosLeft = doors2.left.position.clone().add(app.position);
        let adjustedPosRight = doors2.right.position.clone().add(app.position);
        let distance = tmpVec3a.set( ( adjustedPosLeft.x + adjustedPosRight.x ) / 2, 0, ( adjustedPosLeft.z + adjustedPosRight.z ) / 2 ).sub( localPlayer.position );
        distance.y = 0;
        distance = distance.length();

        if ( distance < 5 && doors2.state !== 'opened' ) {

            doors2.state = 'opening';

        }

        if ( distance > 5 && doors2.state !== 'closed' ) {

            doors2.state = 'closing';

        }

        if ( doors2.state === 'opening' ) {

            doors2.offset += doors2.speed;
            doors2.left.position.x = doors2.left.userData.origPos.x - doors2.offset;
            doors2.right.position.x = doors2.right.userData.origPos.x + doors2.offset;

            if ( doors2.offset >= doors2.offsetMax ) {

                doors2.state = 'opened';

            }

        }

        if ( doors2.state === 'closing' ) {

            doors2.offset -= doors2.speed;
            doors2.left.position.x = doors2.left.userData.origPos.x - doors2.offset;
            doors2.right.position.x = doors2.right.userData.origPos.x + doors2.offset;

            if ( doors2.offset <= 0 ) {

                doors2.state = 'closed';

            }

        }

        doors2.left.updateWorldMatrix();
        doors2.right.updateWorldMatrix();

        doors2.colliderL.position.copy(doors2.left.position);
        doors2.colliderR.position.copy(doors2.right.position);

        physics.setTransform(doors2.colliderL);
        physics.setTransform(doors2.colliderR);

    };

    //

    useFrame(() => {

        updateDoors();
        updateDoors2();

    });

    useCleanup(() => {

        physics.removeGeometry(floorPhysicsId);

    });

    loadModel({ filePath: baseUrl, fileName: 'combined.glb', pos: { x: 0, y: 0, z: 0 } } ).then( ( podMesh ) => {

        podMesh.traverse( ( item ) => {

            if ( item.name === 'door_left' ) {

                doors.left = item;
                doors.left.updateMatrixWorld();
                doors.left.userData.origPos = doors.left.position.clone();

            }

            if ( item.name === 'door_right' ) {

                doors.right = item;
                doors.right.updateMatrixWorld();
                doors.right.userData.origPos = doors.right.position.clone();

            }

            if ( item.name === 'DoorLeft' ) {

                doors2.left = item;
                doors2.left.updateMatrixWorld();
                doors2.left.userData.origPos = doors2.left.position.clone();

            }

            if ( item.name === 'DoorRight' ) {

                doors2.right = item;
                doors2.right.updateMatrixWorld();
                doors2.right.userData.origPos = doors2.right.position.clone();

            }

        });

        app.add( doors.left );
        app.add( doors.right );
        app.add( doors2.left );
        app.add( doors2.right );
        app.add( podMesh );

        doors.colliderL = physics.addGeometry( doors.left );
        doors.colliderR = physics.addGeometry( doors.right );
        doors2.colliderL = physics.addGeometry( doors2.left );
        doors2.colliderR = physics.addGeometry( doors2.right );
        physics.addGeometry( podMesh );

    });

    return app;

};
