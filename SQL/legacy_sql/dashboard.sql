SELECT * 
FROM (
    SELECT  analytics.ingredient_id
            , i.ingredient_name
            , GREATEST(ROUND(SUM(analytics.total * analytics.multiplier) / SUM(analytics.multiplier)) - i.amount,0) AS analysis
            , u.unit_name
    FROM 
    (
        SELECT 
            increaser.ingredient_id
            , increaser.transaction_date
            , SUM(increaser.amount * u.multiplier * increaser.`usage`) AS total
            , power(0.5,datediff(current_date() , date(increaser.transaction_date)) + 1) as multiplier
            , 1 as unit_id
        FROM
        (
            (
                SELECT  
                    ingredient_id
                    , transaction_date
                    , amount
                    , unit_id 
                    , 1 AS `usage`
                FROM Missing
            )

            UNION ALL

            (
                SELECT  
                    ingredient_id
                    , transaction_date
                    , amount
                    , unit_id 
                    , 1 AS `usage`
                FROM Missed_Opportunity
            )

            UNION ALL

            (
                SELECT	i.ingredient_id
                        , o.order_date AS transaction_date
                        , SUM(ol.amount*mi.amount) AS amount
                        , mi.unit_id
                        , 1 as `usage`
                FROM `order` o
                RIGHT JOIN order_list ol ON o.order_id = ol.order_id
                LEFT JOIN menu m ON ol.menu_id = m.menu_id
                RIGHT JOIN menu_ingredients mi ON m.menu_id = mi.menu_id
                LEFT JOIN ingredients i ON mi.ingredient_id = i.ingredient_id
                GROUP BY    o.order_date
                            , i.ingredient_id
                            , mi.unit_id
                ORDER BY    o.order_date
                            , i.ingredient_id
                            , mi.unit_id
            )

            UNION ALL

            (
                SELECT  
                    ingredient_id
                    , transaction_date
                    , amount
                    , unit_id 
                    , -1 AS `usage`
                FROM Restock
            )

            UNION ALL

            (
                SELECT  
                    ingredient_id
                    , transaction_date
                    , amount
                    , unit_id 
                    , -1 AS `usage`
                FROM Discard
            )    

            
        ) increaser
        LEFT JOIN ingredient_units u 
        ON 
            increaser.ingredient_id = u.ingredient_id 
            AND increaser.unit_id = u.unit_id
        WHERE transaction_date >= DATE_SUB(CURDATE(),INTERVAL 20 DAY)
        GROUP BY ingredient_id, transaction_date
        ORDER BY ingredient_id, transaction_date
    ) analytics 
    LEFT JOIN ingredients i ON i.ingredient_id = analytics.ingredient_id
    LEFT JOIN unit u ON i.ingredient_base_unit = u.unit_id
    GROUP BY analytics.ingredient_id
) analytic
WHERE analysis > 0