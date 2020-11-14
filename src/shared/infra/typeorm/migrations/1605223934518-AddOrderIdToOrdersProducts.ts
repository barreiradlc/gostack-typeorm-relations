import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export default class AddOrderIdToOrdersProducts1605223934518 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        //("miau")


        await queryRunner.addColumn(
            'orders_products',
            new TableColumn({
                name: 'order_id',
                type: 'uuid',
                isNullable: true
            })
        )

        //("miau2")

        await queryRunner.createForeignKey(
            'orders_products',
            new TableForeignKey({
                name: 'OrdersProductsOrder',
                columnNames: ['order_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'orders',
                onDelete: 'SET NULL'
            })
        )
        //("miau3")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('orders_products', 'OrdersProductsOrder')
        await queryRunner.dropColumn('orders_products', 'order_id')
    }

}
